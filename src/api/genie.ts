import { dateTimeStrings } from '@/datetime';
import { fetchJson } from '@/fetch';

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
  displayEligibleAfter?: string;
}

export interface Guest extends GuestEligibility {
  id: string;
  name: string;
  avatarImageUrl?: string;
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
}

export interface Booking {
  experience: {
    id: string;
    name: string;
  };
  park: Park;
  start: DateTime;
  end: DateTime;
  guests: BookingGuest[];
  multipleExperiences: boolean;
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

interface FlexItem {
  id: string;
  type: 'FASTPASS';
  kind: 'FLEX';
  facility: string;
  displayStartDate: string;
  displayStartTime: string;
  displayEndDate: string;
  displayEndTime: string;
  multipleExperiences: boolean;
  guests: { id: string; entitlementId: string }[];
}

interface Profile {
  id: string;
  name: { firstName: string; lastName: string };
  avatarId: string;
}

interface Itinerary {
  assets: { [id: string]: Asset | LocationAsset };
  items: (Item | FlexItem)[];
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

export class GenieClient {
  protected origin: Origin;
  protected getAuthData: () => { accessToken: string; swid: string };
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
    getAuthData: GenieClient['getAuthData'];
    data: GenieClient['data'];
  }) {
    this.origin = args.origin;
    this.getAuthData = args.getAuthData;
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
  }): Promise<{ guests: Guest[]; ineligibleGuests: Guest[] }> {
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
    const ineligibleGuests = res.ineligibleGuests.map(convertGuest);
    const guests = res.guests.map(convertGuest).filter(g => {
      if (!('ineligibleReason' in g)) return true;
      ineligibleGuests.push(g);
      return false;
    });
    [...guests, ...ineligibleGuests].forEach(g => {
      if (!this.guestNames.has(g.id)) this.guestNames.set(g.id, g.name);
    });
    return { guests, ineligibleGuests };
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
    return {
      experience: {
        id: experienceId,
        name: this.data.experiences[experienceId].name,
      },
      park: this.data.parks.find(p => p.id === parkId) as Park,
      start: dateTimeStrings(startDateTime),
      end: dateTimeStrings(endDateTime),
      guests: entitlements.map(e => ({
        id: e.guestId,
        name: this.guestNames.get(e.guestId) || '',
        entitlementId: e.id,
      })),
      multipleExperiences: false,
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
    const { swid } = this.getAuthData();
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
        'end-date': dateTimeStrings(now.setDate(now.getDate() + 1)).date,
        'show-friends': 'false',
      },
      userId: false,
    })) as Itinerary;
    const parkMap = Object.fromEntries(this.parks.map(p => [p.id, p]));
    const bookings = items
      .filter(
        (item): item is FlexItem =>
          item.type === 'FASTPASS' && item.kind === 'FLEX'
      )
      .map(item => {
        const expId = item.facility.split(';')[0];
        const expAsset = assets[item.facility] as LocationAsset;
        const parkId = expAsset.location.split(';')[0];
        return {
          experience: {
            id: expId,
            name: this.data.experiences[expId].name || expAsset.name,
          },
          park: parkMap[parkId],
          start: { date: item.displayStartDate, time: item.displayStartTime },
          end: { date: item.displayEndDate, time: item.displayEndTime },
          multipleExperiences: item.multipleExperiences,
          guests: item.guests.map(guest => {
            const { name } = profiles[guest.id];
            return {
              id: guest.id.split(';')[0],
              entitlementId: guest.entitlementId,
              name: `${name.firstName} ${name.lastName}`.trim(),
            };
          }),
        };
      })
      .sort((a, b) =>
        (a.start.date + a.start.time).localeCompare(b.start.date + b.start.time)
      );
    this.bookingStack.update(bookings);
    return bookings;
  }

  isMostRecent(booking: Booking): boolean {
    return this.bookingStack.isMostRecent(booking);
  }

  protected async request(request: {
    path: string;
    method?: 'GET' | 'POST' | 'DELETE';
    params?: { [key: string]: string };
    data?: unknown;
    key?: string;
    userId?: boolean;
  }): Promise<any> {
    const { swid, accessToken } = this.getAuthData();
    const url = this.origin + request.path;
    const params = { ...request.params };
    if (request.userId ?? true) params.userId = swid;
    const { status, data } = await fetchJson(url, {
      method: request.method || 'GET',
      params,
      data: request.data,
      headers: {
        Authorization: `BEARER ${accessToken}`,
        'User-Agent': 'Mozilla/5.0',
      },
      credentials: 'omit',
    });
    const { key } = request;
    if (String(status)[0] === '2' && (!key || data[key])) {
      return key ? data[key] : data;
    }
    throw new RequestError({ status, data });
  }
}

const bookingString = ({ experience, start }: Booking) =>
  `${experience.id}@${start.date}T${start.time}`;

export const BOOKINGS_KEY = 'bg1.genie.bookings';

export class BookingStack {
  protected bookings: string[] = [];
  protected mostRecent = '';

  constructor(loadFromStorage = true) {
    if (!loadFromStorage) return;
    const { bookings = [], mostRecent = '' } = JSON.parse(
      localStorage.getItem(BOOKINGS_KEY) || '{}'
    ) as {
      bookings?: string[];
      mostRecent?: string;
    };
    this.bookings = bookings;
    this.mostRecent = mostRecent;
  }

  isMostRecent(booking: Booking): boolean {
    return bookingString(booking) === this.mostRecent;
  }

  update(bookings: Booking[]): void {
    const oldBookings = this.bookings;
    this.bookings = bookings.map(bookingString);
    const newBookings = this.bookings.filter(bs => !oldBookings.includes(bs));
    if (newBookings.length > 0) {
      this.mostRecent = newBookings.length === 1 ? newBookings[0] : '';
      localStorage.setItem(
        BOOKINGS_KEY,
        JSON.stringify({
          bookings: this.bookings,
          mostRecent: this.mostRecent,
        })
      );
    }
  }
}
