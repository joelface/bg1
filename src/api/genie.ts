import { dateTimeStrings } from '/datetime';
import { fetchJson } from '/fetch';
import { AuthStore } from './auth/store';

const ORIGIN_TO_RESORT = {
  'https://disneyworld.disney.go.com': 'WDW',
  'https://disneyland.disney.go.com': 'DLR',
} as const;

const RESORT_TO_ITINERARY_API_NAME = {
  WDW: 'wdw-itinerary-api',
  DLR: 'dlr-itinerary-web-api',
} as const;

export type Origin = keyof typeof ORIGIN_TO_RESORT;

export function isGenieOrigin(origin: string): origin is Origin {
  return origin in ORIGIN_TO_RESORT;
}

export interface Experience {
  id: string;
  name: string;
  type: 'ATTRACTION' | 'ENTERTAINMENT';
  standby: {
    available: boolean;
    unavailableReason?: 'TEMPORARILY_DOWN' | 'NOT_STANDBY_ENABLED';
    waitTime?: number;
    displayNextShowTime?: string;
  };
  additionalShowTimes?: string[];
  flex?: {
    available: boolean;
    nextAvailableTime?: string;
    enrollmentStartTime?: string;
    preexistingPlan?: boolean;
  };
  individual?: {
    available: boolean;
    displayPrice: string;
  };
  priority?: number;
}

export type PlusExperience = Experience & Required<Pick<Experience, 'flex'>>;

interface GuestEligibility {
  ineligibleReason?:
    | 'INVALID_PARK_ADMISSION'
    | 'PARK_RESERVATION_NEEDED'
    | 'GENIE_PLUS_NEEDED'
    | 'EXPERIENCE_LIMIT_REACHED'
    | 'TOO_EARLY';
  eligibleAfter?: string;
}

export interface Guest extends GuestEligibility {
  id: string;
  name: string;
  avatarImageUrl?: string;
}

export interface Guests {
  eligible: Guest[];
  ineligible: Guest[];
}

interface ApiGuest extends GuestEligibility {
  id: string;
  firstName: string;
  lastName: string;
}

interface GuestsResponse {
  guests: ApiGuest[];
  ineligibleGuests: ApiGuest[];
  primaryGuestId: string;
}

interface OfferResponse {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  changeStatus: 'NONE' | 'PARK_HOPPING';
}

export interface Offer {
  id: string;
  start: DateTime;
  end: DateTime;
  changeStatus: 'NONE' | 'PARK_HOPPING';
}

export interface Park {
  id: string;
  name: string;
  abbr: string;
  theme: { bg: string };
}

interface ResortData {
  parks: Park[];
  experiences: { [id: string]: { name: string; priority?: number } };
  pdts: { [id: string]: string[] };
}

export interface NewBookingResponse {
  id: 'NEW_BOOKING';
  assignmentDetails: {
    product: 'INDIVIDUAL';
    reason: 'OTHER';
  };
  startDateTime: string;
  endDateTime: string;
  entitlements: {
    id: string;
    guestId: string;
    usageDetails: {
      status: 'BOOKED';
      modifiable: boolean;
      redeemable: boolean;
    };
  }[];
  singleExperienceDetails: {
    experienceId: string;
    parkId: string;
  };
}

interface DateTime {
  date: string;
  time: string;
}

export interface BookingGuest extends Guest {
  entitlementId: string;
  redemptions?: number;
}

export interface Booking {
  experience: {
    id: string;
    name: string;
  };
  park: Park;
  start: Partial<DateTime>;
  end: Partial<DateTime>;
  cancellable: boolean;
  guests: BookingGuest[];
  choices?: Pick<Experience, 'id' | 'name'>[];
}

interface Asset {
  id: string;
  type: string;
  name: string;
  media: {
    small: {
      transcodeTemplate: string;
      url: string;
    };
  };
}

interface LocationAsset extends Asset {
  location: string;
}

interface Item {
  type: string;
  kind: string;
}

interface FastPass {
  id: string;
  type: 'FASTPASS';
  kind: 'FLEX' | 'OTHER';
  facility: string;
  assets: { content: string; excluded: boolean; original: boolean }[];
  displayStartDate?: string;
  displayStartTime?: string;
  displayEndDate?: string;
  displayEndTime?: string;
  cancellable: boolean;
  multipleExperiences: boolean;
  guests: {
    id: string;
    entitlementId: string;
    redemptionsRemaining?: number;
  }[];
}

interface Profile {
  id: string;
  name: { firstName: string; lastName: string };
  avatarId: string;
}

interface Itinerary {
  assets: { [id: string]: Asset | LocationAsset };
  items: (Item | FastPass)[];
  profiles: { [id: string]: Profile };
}

export class RequestError extends Error {
  name = 'RequestError';

  constructor(
    public response: Awaited<ReturnType<typeof fetchJson>>,
    message = 'Request failed'
  ) {
    super(`${message}: ${JSON.stringify(response)}`);
  }
}

const idNum = (id: string) => id.split(';')[0];

export class GenieClient {
  readonly maxPartySize = 12;
  onUnauthorized = () => undefined;
  protected origin: Origin;
  protected authStore: Public<AuthStore>;
  protected data: ResortData;
  protected guestNames = new Map<string, string>();
  protected bookingStack: BookingStack;
  protected _primaryGuestId = '';

  static async load(
    args: Omit<ConstructorParameters<typeof GenieClient>[0], 'data'>
  ) {
    const data = (
      await import(
        `./data/${ORIGIN_TO_RESORT[args.origin].toLocaleLowerCase()}.ts`
      )
    ).default;
    return new GenieClient({ ...args, data });
  }

  constructor(args: {
    origin: GenieClient['origin'];
    authStore: GenieClient['authStore'];
    data: GenieClient['data'];
  }) {
    this.origin = args.origin;
    this.authStore = args.authStore;
    this.data = args.data;
    this.bookingStack = new BookingStack();
  }

  get resort() {
    return ORIGIN_TO_RESORT[this.origin];
  }

  get parks() {
    return this.data.parks;
  }

  async plusExperiences(park: Pick<Park, 'id'>): Promise<PlusExperience[]> {
    const experiences: Omit<Experience, 'name' | 'parkId'>[] =
      await this.request({
        path: `/tipboard-vas/api/v1/parks/${encodeURIComponent(
          park.id
        )}/experiences`,
        key: 'availableExperiences',
      });
    return experiences
      .map(exp => ({ ...exp, ...this.data.experiences[exp.id] }))
      .filter((exp): exp is PlusExperience => !!(exp.name && exp.flex));
  }

  async guests(args: {
    experience: Pick<Experience, 'id'>;
    park: Pick<Park, 'id'>;
  }): Promise<Guests> {
    const res: GuestsResponse = await this.request({
      path: '/ea-vas/api/v1/guests',
      params: {
        productType: 'FLEX',
        experienceId: args.experience.id,
        parkId: args.park.id,
      },
    });
    this._primaryGuestId = res.primaryGuestId;
    const convertGuest = ({ firstName, lastName, ...rest }: ApiGuest) => ({
      ...rest,
      name: `${firstName} ${lastName}`.trim(),
    });
    const ineligible = res.ineligibleGuests.map(convertGuest);
    const eligible = res.guests.map(convertGuest).filter(g => {
      if (!('ineligibleReason' in g)) return true;
      ineligible.push(g);
      return false;
    });
    [...eligible, ...ineligible].forEach(g => {
      if (!this.guestNames.has(g.id)) this.guestNames.set(g.id, g.name);
    });
    eligible.sort((a, b) => a.name.localeCompare(b.name));
    ineligible.sort((a, b) => {
      const nameCmp = a.name.localeCompare(b.name);
      if (a.eligibleAfter || b.eligibleAfter) {
        return (
          (a.eligibleAfter || '99').localeCompare(b.eligibleAfter || '99') ||
          nameCmp
        );
      }
      if (a.ineligibleReason === b.ineligibleReason) return nameCmp;
      if (a.ineligibleReason === 'EXPERIENCE_LIMIT_REACHED') return -1;
      if (b.ineligibleReason === 'EXPERIENCE_LIMIT_REACHED') return 1;
      return nameCmp;
    });
    return { eligible, ineligible };
  }

  async primaryGuestId(args: Parameters<GenieClient['guests']>[0]) {
    if (!this._primaryGuestId) await this.guests(args);
    return this._primaryGuestId;
  }

  async offer({
    experience,
    park,
    guests,
  }: {
    experience: Pick<PlusExperience, 'id' | 'flex'>;
    park: Pick<Park, 'id'>;
    guests: Pick<Guest, 'id'>[];
  }): Promise<Offer> {
    const { id, date, startTime, endTime, changeStatus }: OfferResponse =
      await this.request({
        path: '/ea-vas/api/v1/products/flex/offers',
        method: 'POST',
        data: {
          productType: 'FLEX',
          guestIds: guests.map(g => g.id),
          primaryGuestId: await this.primaryGuestId({ experience, park }),
          parkId: park.id,
          experienceId: experience.id,
          selectedTime: experience.flex.nextAvailableTime,
        },
        key: 'offer',
      });
    return {
      id,
      start: { date, time: startTime },
      end: { date, time: endTime },
      changeStatus,
    };
  }

  async cancelOffer(offer: Pick<Offer, 'id'>) {
    await this.request({
      path: `/ea-vas/api/v1/offers/${encodeURIComponent(offer.id)}`,
      method: 'DELETE',
      params: {
        productType: 'FLEX',
      },
      userId: false,
    });
  }

  async book(offer: Pick<Offer, 'id'>): Promise<Booking> {
    const {
      singleExperienceDetails: { experienceId, parkId },
      entitlements,
      startDateTime,
      endDateTime,
    }: NewBookingResponse = await this.request({
      path: `/ea-vas/api/v1/products/flex/bookings`,
      method: 'POST',
      userId: false,
      data: { offerId: offer.id },
      key: 'booking',
    });
    this.bookings(); // Load bookings to refresh booking stack
    return {
      experience: {
        id: experienceId,
        name: this.data.experiences[experienceId].name,
      },
      park: this.data.parks.find(p => p.id === parkId) as Park,
      start: dateTimeStrings(startDateTime),
      end: dateTimeStrings(endDateTime),
      cancellable: true,
      guests: entitlements.map(e => ({
        id: e.guestId,
        name: this.guestNames.get(e.guestId) || '',
        entitlementId: e.id,
      })),
    };
  }

  async cancelBooking(
    guests: Pick<BookingGuest, 'entitlementId'>[]
  ): Promise<void> {
    const ids = guests.map(g => g.entitlementId);
    const idParam = ids.map(encodeURIComponent).join(',');
    await this.request({
      path: `/ea-vas/api/v1/entitlements/${idParam}`,
      method: 'DELETE',
      userId: false,
    });
  }

  async bookings(): Promise<Booking[]> {
    const { swid } = this.authStore.getData();
    const now = new Date(Date.now());
    const itineraryApiName = RESORT_TO_ITINERARY_API_NAME[this.resort];
    const {
      items = [],
      assets = {},
      profiles = {},
    } = (await this.request({
      path: `/plan/${itineraryApiName}/api/v1/itinerary-items/${swid}`,
      params: {
        destination: this.resort,
        fields: 'items,profiles,assets',
        'item-types': 'FASTPASS',
        'guest-locators': swid + ';type=swid',
        'guest-locator-groups': 'MY_FAMILY',
        'start-date': dateTimeStrings(now).date,
        'end-date': dateTimeStrings(
          new Date(now.getTime()).setDate(now.getDate() + 1)
        ).date,
        'show-friends': 'false',
      },
      userId: false,
    })) as Itinerary;
    const parkMap = Object.fromEntries(this.parks.map(p => [p.id, p]));
    const earliest = dateTimeStrings(
      new Date(now.getTime()).setMinutes(now.getMinutes() - 15)
    );
    const types = new Set(['FLEX', 'OTHER']);
    const bookings = items
      .filter(
        (item): item is FastPass =>
          item.type === 'FASTPASS' && types.has(item.kind)
      )
      .filter(
        fp =>
          (!fp.displayEndDate || fp.displayEndDate >= earliest.date) &&
          (!fp.displayEndTime || fp.displayEndTime >= earliest.time)
      )
      .map(fp => {
        const id = idNum(fp.facility);
        const expAsset = assets[fp.facility] as LocationAsset;
        const { name } = this.data.experiences[id] || expAsset;
        const parkId = idNum(expAsset.location);
        const booking: Booking = {
          experience: { id, name },
          park: parkMap[parkId],
          start: {
            date: fp.displayStartDate,
            time: fp.displayStartTime,
          },
          end: {
            date: fp.displayEndDate,
            time: fp.displayEndTime,
          },
          cancellable: fp.cancellable,
          guests: fp.guests.map(g => {
            const { name } = profiles[g.id];
            const guest: BookingGuest = {
              id: idNum(g.id),
              entitlementId: g.entitlementId,
              name: `${name.firstName} ${name.lastName}`.trim(),
              ...(g.redemptionsRemaining !== undefined && {
                redemptions: g.redemptionsRemaining,
              }),
            };
            return guest;
          }),
        };
        if (fp.multipleExperiences) {
          booking.experience = { id: '', name: 'Multiple Experiences' };
          booking.choices = fp.assets
            .filter(a => !a.excluded && !a.original)
            .map(({ content }) => {
              const id = idNum(content);
              const { name } = this.data.experiences[id] || assets[content];
              return { id, name };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
        }
        return booking;
      })
      .sort((a, b) =>
        ((a.start.date || '0000-00-00') + (a.start.time || '')).localeCompare(
          (b.start.date || '0000-00-00') + (b.start.time || '')
        )
      );
    this.bookingStack.update(bookings);
    return bookings;
  }

  isRebookable(booking: Booking): boolean {
    return this.bookingStack.isRebookable(booking);
  }

  pdt(park: Pick<Park, 'id'>): string | undefined {
    const now = dateTimeStrings().time.slice(0, 5);
    return this.data.pdts[park.id]?.find(pdt => pdt >= now);
  }

  logOut(): void {
    this.authStore.deleteData();
    this.onUnauthorized();
  }

  protected async request(request: {
    path: string;
    method?: 'GET' | 'POST' | 'DELETE';
    params?: { [key: string]: string };
    data?: unknown;
    key?: string;
    userId?: boolean;
  }): Promise<any> {
    const { swid, accessToken } = this.authStore.getData();
    const url = this.origin + request.path;
    const params = { ...request.params };
    if (request.userId ?? true) params.userId = swid;
    const { status, data } = await fetchJson(url, {
      method: request.method || 'GET',
      params,
      data: request.data,
      headers: {
        Authorization: `BEARER ${accessToken}`,
      },
    });
    if (status === 401) {
      setTimeout(() => this.logOut());
    } else {
      const { key } = request;
      if (String(status)[0] === '2' && (!key || data[key])) {
        return key ? data[key] : data;
      }
    }
    throw new RequestError({ status, data });
  }
}

export const BOOKINGS_KEY = 'bg1.genie.bookings';

interface BookingStackData {
  entitlementIds: string[];
  mostRecent: { [guestId: string]: string };
}

export class BookingStack {
  protected entitlementIds: string[] = [];
  protected mostRecent: Map<string, string> = new Map();

  constructor(loadFromStorage = true) {
    if (!loadFromStorage) return;
    const { entitlementIds = [], mostRecent = {} } = JSON.parse(
      localStorage.getItem(BOOKINGS_KEY) || '{}'
    ) as BookingStackData;
    this.entitlementIds = entitlementIds;
    this.mostRecent = new Map(Object.entries(mostRecent));
  }

  isRebookable(booking: Booking): boolean {
    return booking.guests.every(
      g => this.mostRecent.get(g.id) === g.entitlementId
    );
  }

  update(bookings: Booking[]): void {
    const mostRecent = new Map<string, string>();
    const oldEntIds = new Set(this.entitlementIds);
    this.entitlementIds = bookings
      .filter(({ cancellable }) => cancellable)
      .map(booking =>
        booking.guests.map(({ id, entitlementId }) => {
          this.entitlementIds.push(entitlementId);
          if (!oldEntIds.has(entitlementId)) {
            mostRecent.set(id, mostRecent.has(id) ? '' : entitlementId);
          }
          return entitlementId;
        })
      )
      .flat(1);
    this.mostRecent = new Map([...this.mostRecent, ...mostRecent]);
    if (mostRecent.size > 0) {
      localStorage.setItem(
        BOOKINGS_KEY,
        JSON.stringify({
          entitlementIds: this.entitlementIds,
          mostRecent: Object.fromEntries(this.mostRecent),
        } as BookingStackData)
      );
    }
  }
}
