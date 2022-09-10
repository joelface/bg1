import { dateTimeStrings, splitDateTime } from '@/datetime';
import { fetchJson } from '@/fetch';
import { AuthStore } from './auth/store';
import { avatarUrl } from './avatar';

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
  park: Park;
  geo: readonly [number, number];
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
  drop?: boolean;
}

export type PlusExperience = Experience & Required<Pick<Experience, 'flex'>>;

type ApiExperience = Omit<
  Experience,
  'name' | 'park' | 'priority' | 'geo' | 'drop'
>;
type ApiPlusExperience = ApiExperience & Required<Pick<Experience, 'flex'>>;

interface ExperiencesResponse {
  availableExperiences: ApiExperience[];
  eligibility?: {
    flexEligibilityWindows?: {
      time: {
        time: string;
        timeDisplayString: string;
        timeStatus: string;
      };
    }[];
    guestIds: string[];
  };
}

interface GuestEligibility {
  ineligibleReason?:
    | 'INVALID_PARK_ADMISSION'
    | 'PARK_RESERVATION_NEEDED'
    | 'GENIE_PLUS_NEEDED'
    | 'EXPERIENCE_LIMIT_REACHED'
    | 'TOO_EARLY'
    | 'TOO_EARLY_FOR_PARK_HOPPING';
  eligibleAfter?: string;
}

export interface Guest extends GuestEligibility {
  id: string;
  name: string;
  avatarImageUrl?: string;
  transactional?: boolean;
}

export interface Guests {
  eligible: Guest[];
  ineligible: Guest[];
}

interface ApiGuest extends GuestEligibility {
  id: string;
  firstName: string;
  lastName: string;
  primary: boolean;
  characterId: string;
}

interface GuestsResponse {
  guests: ApiGuest[];
  ineligibleGuests: ApiGuest[];
  primaryGuestId: string;
}

interface OfferResponse {
  offer: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    changeStatus: 'NONE' | 'CHANGED' | 'PARK_HOPPING';
    status: 'ACTIVE' | 'DELETED';
  };
  eligibleGuests: ApiGuest[];
  ineligibleGuests: ApiGuest[];
}

export interface Offer {
  id: string;
  start: DateTime;
  end: DateTime;
  active: boolean;
  changed: boolean;
  guests: {
    eligible: Guest[];
    ineligible: Guest[];
  };
}

export interface Park {
  id: string;
  name: string;
  icon: string;
  geo: { n: number; s: number; e: number; w: number };
  theme: { bg: string; text: string };
}

export interface ResortData {
  parks: Park[];
  experiences: {
    [id: string]: {
      name: string;
      geo: readonly [number, number];
      pdtMask?: number;
      priority?: number;
    };
  };
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

export interface EntitledGuest extends Guest {
  entitlementId: string;
  redemptions?: number;
}

interface BaseBooking {
  type: string;
  id: string;
  name: string;
  start: Partial<DateTime>;
  end: Partial<DateTime> | undefined;
  cancellable: boolean;
  guests: Guest[];
  choices?: Pick<Experience, 'id' | 'name' | 'park'>[];
  bookingId: string;
}

export interface LightningLane extends BaseBooking {
  type: 'LL';
  park: Park;
  end: Partial<DateTime>;
  guests: EntitledGuest[];
}

export interface Reservation extends BaseBooking {
  type: 'RES';
  park: Partial<Park> & Pick<Park, 'id' | 'name'>;
  start: DateTime;
  end: undefined;
  cancellable: false;
}

export type Booking = LightningLane | Reservation;

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
  facility: string;
  location: string;
}

interface FastPassItem {
  id: string;
  type: 'FASTPASS';
  kind: 'FLEX' | 'OTHER' | 'STANDARD';
  facility: string;
  assets: { content: string; excluded: boolean; original: boolean }[];
  startDateTime?: string;
  endDateTime?: string;
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

interface ReservationItem {
  id: string;
  type: 'DINING' | 'ACTIVITY';
  startDateTime: string;
  guests: { id: string }[];
  asset: string;
}

interface Profile {
  id: string;
  name: { firstName: string; lastName: string };
  avatarId: string;
  type: 'registered' | 'transactional';
}

interface Itinerary {
  assets: { [id: string]: Asset };
  items: (FastPassItem | ReservationItem | object)[];
  profiles: { [id: string]: Profile };
}

type EventName = 'bookingChange';
type EventListener = () => void;

export class RequestError extends Error {
  name = 'RequestError';

  constructor(
    public response: Awaited<ReturnType<typeof fetchJson>>,
    message = 'Request failed'
  ) {
    super(`${message}: ${JSON.stringify(response)}`);
  }
}

const RES_TYPES = new Set(['ACTIVITY', 'DINING']);
const FP_KINDS = new Set(['FLEX', 'OTHER', 'STANDARD']);

const idNum = (id: string) => id.split(';')[0];

export class GenieClient {
  readonly maxPartySize = 12;
  onUnauthorized = () => undefined;
  protected origin: Origin;
  protected authStore: Public<AuthStore>;
  protected data: ResortData;
  protected parkMap: { [id: string]: Park };
  protected guestCache = new Map<
    string,
    { name: string; characterId: string }
  >();
  protected bookingStack: BookingStack;
  protected listeners: Record<EventName, Set<EventListener>> = {
    bookingChange: new Set(),
  };
  protected _primaryGuestId = '';

  static async load(
    args: Omit<ConstructorParameters<typeof GenieClient>[0], 'data'>
  ) {
    const resort = ORIGIN_TO_RESORT[args.origin].toLowerCase();
    const data = (await import(`./data/${resort}.ts`)).default;
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
    this.parkMap = Object.fromEntries(this.parks.map(p => [p.id, p]));
    this.bookingStack = new BookingStack();
  }

  get resort() {
    return ORIGIN_TO_RESORT[this.origin];
  }

  get parks() {
    return this.data.parks;
  }

  async experiences(park: Park): Promise<{
    plus: PlusExperience[];
    nextBookTime?: string;
  }> {
    await this.primaryGuestId(); // prime the guest cache
    const res: ExperiencesResponse = await this.request({
      path: `/tipboard-vas/api/v1/parks/${encodeURIComponent(
        park.id
      )}/experiences`,
      params: { eligibilityGuestIds: [...this.guestCache.keys()].join(',') },
    });
    const nextBookTime = (res.eligibility?.flexEligibilityWindows || []).sort(
      (a, b) => a.time.time.localeCompare(b.time.time)
    )[0]?.time.time;
    const pdt = this.nextDropTime(park);
    const pdtIdx = (this.data.pdts[park.id] || []).indexOf(pdt || '');
    const pdtBit = 1 << pdtIdx;
    return {
      plus: res.availableExperiences
        .filter(
          (exp): exp is ApiPlusExperience =>
            !!exp.flex && exp.id in this.data.experiences
        )
        .map(exp => {
          const { pdtMask = 0, ...expData } = this.data.experiences[exp.id];
          const e: PlusExperience = {
            ...exp,
            ...expData,
            park,
            drop: !!(pdtBit & pdtMask),
          };
          return e;
        }),
      nextBookTime,
    };
  }

  async guests(experience?: {
    id: string;
    park: { id: string };
  }): Promise<Guests> {
    experience ||= { id: '0', park: { id: '0' } };
    const res: GuestsResponse = await this.request({
      path: '/ea-vas/api/v1/guests',
      params: {
        productType: 'FLEX',
        experienceId: experience.id,
        parkId: experience.park.id,
      },
    });
    this._primaryGuestId = res.primaryGuestId;
    const ineligible = res.ineligibleGuests.map(this.convertGuest);
    const eligible = res.guests
      .map(this.convertGuest)
      .filter(g => !('ineligibleReason' in g) || (ineligible.push(g) && false));
    ineligible.sort((a, b) => {
      const cmp = +!a.primary - +!b.primary || a.name.localeCompare(b.name);
      if (a.eligibleAfter || b.eligibleAfter) {
        return (
          (a.eligibleAfter || '99').localeCompare(b.eligibleAfter || '99') ||
          cmp
        );
      }
      if (a.ineligibleReason === b.ineligibleReason) return cmp;
      if (a.ineligibleReason === 'EXPERIENCE_LIMIT_REACHED') return -1;
      if (b.ineligibleReason === 'EXPERIENCE_LIMIT_REACHED') return 1;
      return cmp;
    });
    return { eligible, ineligible };
  }

  async primaryGuestId(args?: Parameters<GenieClient['guests']>[0]) {
    if (!this._primaryGuestId) await this.guests(args);
    return this._primaryGuestId;
  }

  async offer({
    experience,
    guests,
  }: {
    experience: Pick<PlusExperience, 'id' | 'flex'> & {
      park: Pick<Park, 'id'>;
    };
    guests: Pick<Guest, 'id'>[];
  }): Promise<Offer> {
    const res: OfferResponse = await this.request({
      path: '/ea-vas/api/v2/products/flex/offers',
      method: 'POST',
      data: {
        guestIds: guests.map(g => g.id),
        ineligibleGuests: [],
        primaryGuestId: await this.primaryGuestId(experience),
        parkId: experience.park.id,
        experienceId: experience.id,
        selectedTime: experience.flex.nextAvailableTime,
      },
      userId: false,
    });
    const { id, date, startTime, endTime, status, changeStatus } = res.offer;
    return {
      id,
      start: { date, time: startTime },
      end: { date, time: endTime },
      active: status === 'ACTIVE',
      changed: changeStatus !== 'NONE',
      guests: {
        eligible: (res.eligibleGuests || []).map(this.convertGuest),
        ineligible: (res.ineligibleGuests || []).map(this.convertGuest),
      },
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

  async book(offer: Pick<Offer, 'id'>): Promise<LightningLane> {
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
      type: 'LL',
      ...this.getExperience(experienceId, parkId),
      bookingId: entitlements[0]?.id,
      start: splitDateTime(startDateTime),
      end: splitDateTime(endDateTime),
      cancellable: true,
      guests: entitlements.map(e => {
        const g = this.guestCache.get(e.guestId);
        return {
          id: e.guestId,
          name: g?.name || '',
          avatarImageUrl: avatarUrl(g?.characterId),
          entitlementId: e.id,
        };
      }),
    };
  }

  async cancelBooking(
    guests: Pick<EntitledGuest, 'entitlementId'>[]
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
      path: `/plan/${itineraryApiName}/api/v1/itinerary-items/${swid}?item-types=FASTPASS&item-types=DINING&item-types=ACTIVITY`,
      params: {
        destination: this.resort,
        fields: 'items,profiles,assets',
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
    const getGuest = (g: ReservationItem['guests'][0]) => {
      const { name, avatarId, type } = profiles[g.id];
      const id = idNum(g.id);
      return {
        id,
        name: `${name.firstName} ${name.lastName}`.trim(),
        avatarImageUrl: avatarUrl(avatarId),
        ...(type === 'transactional' && { transactional: true }),
      };
    };
    const bookings = items
      .filter(
        (item): item is FastPassItem | ReservationItem =>
          'type' in item &&
          ((item.type === 'FASTPASS' && FP_KINDS.has(item.kind)) ||
            RES_TYPES.has(item.type))
      )
      .map(item => {
        if (item.type !== 'FASTPASS') {
          const activityAsset = assets[item.asset];
          const facilityAsset = assets[activityAsset.facility];
          const parkIdStr = facilityAsset.location;
          const park = this.parkMap[idNum(parkIdStr)] || {
            id: parkIdStr,
            name: assets[parkIdStr].name,
          };
          const res: Reservation = {
            type: 'RES',
            id: idNum(item.asset),
            park,
            name: activityAsset.name,
            start: dateTimeStrings(new Date(item.startDateTime)),
            end: undefined,
            cancellable: false,
            guests: item.guests
              .map(getGuest)
              .sort(
                (a, b) =>
                  +(b.id === this._primaryGuestId) -
                    +(a.id === this._primaryGuestId) ||
                  +!b.transactional - +!a.transactional ||
                  a.name.localeCompare(b.name)
              ),
            bookingId: item.id,
          };
          return res;
        }

        const expAsset = assets[item.facility];
        const parkId = idNum(expAsset.location);
        let booking: LightningLane = {
          type: 'LL',
          ...this.getExperience(idNum(item.facility), parkId, expAsset.name),
          start: {
            date: item.displayStartDate,
            time: item.displayStartTime,
          },
          end: {
            date: item.displayEndDate,
            time: item.displayEndTime,
          },
          cancellable: item.cancellable,
          guests: item.guests.map(g => {
            return {
              ...getGuest(g),
              entitlementId: g.entitlementId,
              ...(g.redemptionsRemaining !== undefined && {
                redemptions: g.redemptionsRemaining,
              }),
            };
          }),
          bookingId: item.guests[0]?.entitlementId,
        };
        if (item.multipleExperiences) {
          const origAsset = item.assets.find(a => a.original);
          if (origAsset) {
            booking = {
              ...booking,
              ...this.getExperience(
                idNum(origAsset.content),
                idNum(assets[origAsset.content].location)
              ),
            };
          }
          booking.choices = item.assets
            .filter(a => !a.excluded && !a.original)
            .map(({ content }) => {
              const { name, location } = assets[content];
              return this.getExperience(idNum(content), idNum(location), name);
            })
            .sort((a, b) => a.name.localeCompare(b.name));
        }
        return booking;
      });
    this.bookingStack.update(bookings);
    return bookings;
  }

  isRebookable(booking: Booking): boolean {
    return this.bookingStack.isRebookable(booking);
  }

  nextDropTime(park: Pick<Park, 'id'>): string | undefined {
    const now = dateTimeStrings().time.slice(0, 5);
    return this.data.pdts?.[park.id]?.find(pdt => pdt >= now);
  }

  logOut(): void {
    this.authStore.deleteData();
    this.onUnauthorized();
  }

  protected getExperience(id: string, parkId: string, name?: string) {
    return {
      id,
      name: (this.data.experiences[id]?.name || name) as string,
      park: this.parkMap[parkId],
    };
  }

  protected convertGuest = (guest: ApiGuest) => {
    const { id, firstName, lastName, characterId, ...rest } = guest;
    const name = `${firstName} ${lastName}`.trim();
    if (!this.guestCache.has(id)) {
      switch (guest.ineligibleReason) {
        case 'INVALID_PARK_ADMISSION':
        case 'PARK_RESERVATION_NEEDED':
        case 'GENIE_PLUS_NEEDED':
          if (guest.primary) this.cacheGuest(id, name, characterId);
          break;
        default:
          this.cacheGuest(id, name, characterId);
      }
    }
    const avatarImageUrl = avatarUrl(characterId);
    return { ...rest, id, name, avatarImageUrl };
  };

  protected cacheGuest(id: string, name: string, characterId: string) {
    this.guestCache.set(id, { name, characterId });
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
        'x-user-id': swid,
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
    return (
      booking.cancellable &&
      booking.guests.every(g => this.mostRecent.get(g.id) === g.entitlementId)
    );
  }

  update(bookings: Booking[]): void {
    const mostRecent = new Map<string, string>();
    const oldEntIds = new Set(this.entitlementIds);
    this.entitlementIds = bookings
      .filter((b: Booking): b is LightningLane => b.cancellable)
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
