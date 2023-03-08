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

export type ExperienceType = 'ATTRACTION' | 'ENTERTAINMENT' | 'CHARACTER';

export interface Experience {
  id: string;
  name: string;
  park: Park;
  land: Land;
  geo?: readonly [number, number];
  type: ExperienceType;
  standby: {
    available: boolean;
    unavailableReason?: 'TEMPORARILY_DOWN' | 'NOT_STANDBY_ENABLED';
    waitTime?: number;
    displayNextShowTime?: string;
  };
  displayAdditionalShowTimes?: string[];
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
  sort?: number;
  experienced?: boolean;
  drop?: boolean;
}

export type PlusExperience = Experience & Required<Pick<Experience, 'flex'>>;

type ApiExperience = Omit<
  Experience,
  'name' | 'park' | 'priority' | 'geo' | 'drop'
>;

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
    | 'TOO_EARLY_FOR_PARK_HOPPING'
    | 'NOT_IN_PARTY';
  eligibleAfter?: string;
}

export interface Guest extends GuestEligibility {
  id: string;
  name: string;
  primary?: boolean;
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
  experience: Pick<PlusExperience, 'id'>;
}

export interface Park {
  id: string;
  name: string;
  icon: string;
  geo: { n: number; s: number; e: number; w: number };
  theme: { bg: string; text: string };
}

export interface Land {
  name: string;
  park: Park;
  sort: number;
  theme: { bg: string; text: string };
}

export interface ExpData {
  name: string;
  land: Land;
  geo?: readonly [number, number];
  pdtMask?: number;
  type?: ExperienceType;
  priority?: number;
  sort?: number;
}

export interface ResortData {
  parks: Park[];
  experiences: {
    [id: string]: ExpData | null | undefined;
  };
  pdts: { [id: string]: number[] };
}

export interface NewBookingResponse {
  id: 'NEW_BOOKING' | 'MODIFIED_BOOKING';
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
  bookingId?: string;
  redemptions?: number;
}

interface BaseBooking {
  type: string;
  subtype: string;
  id: string;
  name: string;
  start: Partial<DateTime>;
  end: Partial<DateTime> | undefined;
  cancellable: boolean;
  modifiable: boolean;
  guests: Guest[];
  choices?: Pick<Experience, 'id' | 'name' | 'park'>[];
  bookingId: string;
}

export interface LightningLane extends BaseBooking {
  type: 'LL';
  subtype: 'G+' | 'ILL' | 'MULTI' | 'DAS' | 'OTHER';
  park: Park;
  end: Partial<DateTime>;
  guests: EntitledGuest[];
}

export interface Reservation extends BaseBooking {
  type: 'RES';
  subtype: 'DINING' | 'ACTIVITY';
  park: Partial<Park> & Pick<Park, 'id' | 'name'>;
  start: DateTime;
  end: undefined;
  cancellable: false;
  modifiable: false;
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
  location?: string;
}

interface FastPassItem {
  id: string;
  type: 'FASTPASS';
  kind: string;
  facility: string;
  assets: { content: string; excluded: boolean; original: boolean }[];
  startDateTime?: string;
  endDateTime?: string;
  displayStartDate?: string;
  displayStartTime?: string;
  displayEndDate?: string;
  displayEndTime?: string;
  cancellable: boolean;
  modifiable: boolean;
  multipleExperiences: boolean;
  guests: {
    id: string;
    bookingId: string;
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
  items: (FastPassItem | ReservationItem | { type: undefined })[];
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

const RES_TYPES = new Set(['ACTIVITY', 'DINING']);

const idNum = (id: string) => id.split(';')[0];

function isModifiable(booking: Booking) {
  const { date, time } = dateTimeStrings();
  return (
    booking.modifiable &&
    date === booking.end.date &&
    time <= (booking.end.time ?? '')
  );
}

export class ModifyNotAllowed extends Error {
  name = 'ModifyNotAllowed';
}

function throwOnNotModifiable(booking?: Booking) {
  if (booking && !isModifiable(booking)) {
    throw new ModifyNotAllowed();
  }
}

export class GenieClient {
  readonly maxPartySize = 12;
  nextBookTime: string | undefined;
  onUnauthorized = () => undefined;
  protected origin: Origin;
  protected authStore: Public<AuthStore>;
  protected expData: ResortData['experiences'];
  protected parkMap: Map<string, Park>;
  protected drops: {
    [parkId: string]: {
      time: string;
      expIds: string[];
    }[];
  } = {};
  protected partyIds = new Set<string>();
  protected guestCache = new Map<
    string,
    { name: string; characterId: string }
  >();
  protected tracker: Public<BookingTracker>;
  protected primaryGuestId = '';

  static async load(
    args: Omit<ConstructorParameters<typeof GenieClient>[0], 'data'>
  ) {
    const resort = ORIGIN_TO_RESORT[args.origin].toLowerCase();
    const data: ResortData = (await import(`./data/${resort}.ts`)).default;
    return new GenieClient({ ...args, data });
  }

  constructor(args: {
    origin: GenieClient['origin'];
    authStore: GenieClient['authStore'];
    data: ResortData;
    tracker?: GenieClient['tracker'];
  }) {
    this.origin = args.origin;
    this.authStore = args.authStore;
    this.parkMap = new Map(args.data.parks.map(p => [p.id, p]));
    this.tracker = args.tracker || new BookingTracker();
    for (const [id, times] of Object.entries(args.data.pdts ?? {})) {
      this.drops[id] = times.map(m => ({
        time: new Date(new Date().setHours(m / 60, m % 60, 0))
          .toTimeString()
          .slice(0, 5),
        expIds: [],
      }));
    }
    this.expData = { ...args.data.experiences };
    for (const [id, exp] of Object.entries(args.data.experiences)) {
      if (!exp?.pdtMask) continue;
      const { id: parkId } = exp.land.park;
      for (const [i, drop] of this.drops?.[parkId]?.entries() ?? []) {
        if (exp.pdtMask & (1 << i)) drop.expIds.push(id);
      }
    }
  }

  get resort() {
    return ORIGIN_TO_RESORT[this.origin];
  }

  get parks() {
    return [...this.parkMap.values()];
  }

  setPartyIds(partyIds: string[]) {
    this.partyIds = new Set(partyIds);
  }

  async experiences(park: Park): Promise<Experience[]> {
    await this.primeGuestCache();
    const res: ExperiencesResponse = await this.request({
      path: `/tipboard-vas/api/v1/parks/${encodeURIComponent(
        park.id
      )}/experiences`,
      params: { eligibilityGuestIds: [...this.guestCache.keys()].join(',') },
    });
    this.nextBookTime = (res.eligibility?.flexEligibilityWindows || []).sort(
      (a, b) => a.time.time.localeCompare(b.time.time)
    )[0]?.time.time;
    const { expIds = [] } = this.nextDrop(park) ?? {};
    return res.availableExperiences
      .filter(exp => !!this.expData[exp.id])
      .map(exp => ({
        ...exp,
        ...(this.expData[exp.id] as ExpData),
        park,
        experienced: this.tracker.experienced(exp),
        drop: expIds.includes(exp.id),
      }));
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
    this.primaryGuestId = res.primaryGuestId;
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
      if (a.ineligibleReason === 'NOT_IN_PARTY') return 1;
      if (b.ineligibleReason === 'NOT_IN_PARTY') return -1;
      if (a.ineligibleReason === 'EXPERIENCE_LIMIT_REACHED') return -1;
      if (b.ineligibleReason === 'EXPERIENCE_LIMIT_REACHED') return 1;
      return cmp;
    });
    return { eligible, ineligible };
  }

  async offer(
    experience: Pick<PlusExperience, 'id' | 'flex'> & {
      park: Pick<Park, 'id'>;
    },
    guests: Pick<Guest, 'id'>[],
    bookingToModify?: LightningLane
  ): Promise<Offer> {
    throwOnNotModifiable(bookingToModify);
    const res: OfferResponse = await this.request({
      path: bookingToModify
        ? '/ea-vas/api/v1/products/modifications/flex/offers'
        : '/ea-vas/api/v2/products/flex/offers',
      method: 'POST',
      data: {
        guestIds: (bookingToModify?.guests ?? guests).map(g => g.id),
        ineligibleGuests: [],
        primaryGuestId: guests
          .map(g => g.id)
          .sort((a, b) => a.localeCompare(b))[0],
        parkId: experience.park.id,
        experienceId: experience.id,
        selectedTime: experience.flex.nextAvailableTime,
        ...(bookingToModify
          ? {
              modificationType:
                experience.id === bookingToModify.id ? 'TIME' : 'EXPERIENCE',
            }
          : {}),
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
      experience,
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

  async book(
    offer: Pick<Offer, 'id' | 'guests' | 'experience'>,
    bookingToModify?: LightningLane,
    guestsToModify?: Pick<Guest, 'id'>[]
  ): Promise<LightningLane> {
    throwOnNotModifiable(bookingToModify);
    const guestIdsToModify = new Set(
      (guestsToModify ?? offer.guests.eligible).map(g => g.id)
    );
    const {
      singleExperienceDetails: { experienceId, parkId },
      entitlements,
      startDateTime,
      endDateTime,
    }: NewBookingResponse = await this.request({
      path: bookingToModify
        ? '/ea-vas/api/v1/products/modifications/flex/bookings'
        : '/ea-vas/api/v1/products/flex/bookings',
      method: 'POST',
      userId: false,
      data: {
        offerId: offer.id,
        ...(bookingToModify
          ? {
              modificationType:
                bookingToModify.id === offer.experience.id
                  ? 'TIME'
                  : 'EXPERIENCE',
              existingEntitlements: bookingToModify.guests
                .filter(g => guestIdsToModify.has(g.id))
                .map(g => ({
                  entitlementId: g.entitlementId,
                  entitlementBookingId: g.bookingId,
                })),
              guestIdsToExclude: bookingToModify.guests
                .filter(g => !guestIdsToModify.has(g.id))
                .map(g => g.id),
            }
          : {}),
      },
      key: 'booking',
    });
    this.updateTracker();
    return {
      type: 'LL',
      subtype: 'G+',
      ...this.getExperience(experienceId, parkId),
      bookingId: entitlements[0]?.id,
      start: splitDateTime(startDateTime),
      end: splitDateTime(endDateTime),
      cancellable: true,
      modifiable: true,
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
    const today = dateTimeStrings(now).date;
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
        'start-date': today,
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

    const earliestResDT = new Date(now);
    earliestResDT.setMinutes(earliestResDT.getMinutes() - 30);

    const getReservation = (item: ReservationItem) => {
      const activityAsset = assets[item.asset];
      const facilityAsset = assets[activityAsset.facility];
      const parkIdStr = facilityAsset.location;
      if (!parkIdStr) return;
      const park = this.parkMap.get(idNum(parkIdStr)) || {
        id: parkIdStr,
        name: assets[parkIdStr].name,
      };
      const start = new Date(item.startDateTime);
      if (start < earliestResDT) return;
      const res: Reservation = {
        type: 'RES',
        subtype: item.type,
        id: idNum(item.asset),
        park,
        name: activityAsset.name,
        start: dateTimeStrings(start),
        end: undefined,
        cancellable: false,
        modifiable: false,
        guests: item.guests
          .map(getGuest)
          .sort(
            (a, b) =>
              +(b.id === this.primaryGuestId) -
                +(a.id === this.primaryGuestId) ||
              +!b.transactional - +!a.transactional ||
              a.name.localeCompare(b.name)
          ),
        bookingId: item.id,
      };
      return res;
    };

    const getLightningLane = (item: FastPassItem) => {
      const kindToSubtype: {
        [key: string]: LightningLane['subtype'] | undefined;
      } = {
        FLEX: 'G+',
        STANDARD: 'ILL',
        DAS: 'DAS',
        FDS: 'DAS',
        OTHER: 'OTHER',
      };
      const subtype = item.multipleExperiences
        ? 'MULTI'
        : kindToSubtype[item.kind];
      if (!subtype) return;
      const isGeniePlus = subtype === 'G+';
      const expAsset = assets[item.facility];
      const parkId = idNum((expAsset as Required<Asset>).location);
      let booking: LightningLane = {
        type: 'LL',
        subtype,
        ...this.getExperience(idNum(item.facility), parkId, expAsset.name),
        start: {
          date: item.displayStartDate,
          time: item.displayStartTime,
        },
        end: {
          date: item.displayEndDate,
          time: item.displayEndTime,
        },
        cancellable: item.cancellable && isGeniePlus,
        modifiable: item.modifiable && isGeniePlus,
        guests: item.guests.map(g => {
          return {
            ...getGuest(g),
            entitlementId: g.entitlementId,
            bookingId: g.bookingId,
            ...(g.redemptionsRemaining !== undefined && {
              redemptions: g.redemptionsRemaining,
            }),
          };
        }),
        bookingId: item.guests[0]?.entitlementId,
      };
      booking.modifiable = isModifiable(booking);
      if (item.multipleExperiences) {
        const origAsset = item.assets.find(a => a.original);
        if (origAsset) {
          booking = {
            ...booking,
            ...this.getExperience(
              idNum(origAsset.content),
              idNum((assets[origAsset.content] as Required<Asset>).location)
            ),
          };
        }
        booking.choices = item.assets
          .filter(a => !a.excluded && !a.original)
          .map(({ content }) => {
            const { name, location } = assets[content] as Required<Asset>;
            return this.getExperience(idNum(content), idNum(location), name);
          })
          .sort((a, b) => a.name.localeCompare(b.name));
      }
      return booking;
    };

    const bookings = items
      .map(item => {
        try {
          if (item.type === 'FASTPASS') {
            return getLightningLane(item);
          } else if (item.type && RES_TYPES.has(item.type)) {
            return getReservation(item);
          }
        } catch (error) {
          console.error(error);
        }
      })
      .filter(
        (booking): booking is Booking =>
          !!booking && (booking.start.date || today) <= today
      );
    this.tracker.update(bookings, this);
    return bookings;
  }

  updateTracker = this.bookings;

  upcomingDrops(park: Pick<Park, 'id'>): {
    time: string;
    experiences: { id: string; name: string }[];
  }[] {
    const now = dateTimeStrings().time.slice(0, 5);
    return (this.drops?.[park.id] ?? [])
      .filter(({ time }) => time >= now)
      .map(({ time, expIds }) => ({
        time,
        experiences: expIds
          .map(id => ({
            id,
            name: this.expData[id]?.name,
          }))
          .filter(
            (exp): exp is { id: string; name: string } => exp.name !== undefined
          )
          .sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }

  nextDropTime(park: Pick<Park, 'id'>): string | undefined {
    return this.nextDrop(park)?.time;
  }

  logOut(): void {
    this.authStore.deleteData();
    this.onUnauthorized();
  }

  protected nextDrop(park: Pick<Park, 'id'>) {
    const now = dateTimeStrings().time.slice(0, 5);
    return this.drops?.[park.id]?.find(({ time }) => time >= now);
  }

  protected getExperience(id: string, parkId: string, name?: string) {
    return {
      id,
      name: (this.expData[id]?.name || name) as string,
      park: this.parkMap.get(parkId) as Park,
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
    if (this.partyIds.size > 0 && !this.partyIds.has(id)) {
      rest.ineligibleReason = 'NOT_IN_PARTY';
      delete rest.eligibleAfter;
    }
    return { ...rest, id, name, avatarImageUrl };
  };

  protected async primeGuestCache() {
    if (this.primaryGuestId !== '') return;
    this.primaryGuestId = '.';
    await this.guests();
  }

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

interface BookingTrackerData {
  date: string;
  expIds: string[];
  experiencedExpIds: string[];
}

export class BookingTracker {
  protected date: string;
  protected expIds = new Set<string>();
  protected experiencedExpIds = new Set<string>();

  constructor() {
    const {
      date = dateTimeStrings().date,
      expIds: expIds = [],
      experiencedExpIds = [],
    }: BookingTrackerData = JSON.parse(
      localStorage.getItem(BOOKINGS_KEY) || '{}'
    );
    this.date = date;
    this.expIds = new Set(expIds);
    this.experiencedExpIds = new Set(experiencedExpIds);
    this.checkDate();
  }

  /**
   * Returns true if experienced or expired
   */
  experienced(experience: Pick<Experience, 'id'>) {
    return this.experiencedExpIds.has(experience.id);
  }

  async update(bookings: Booking[], client: GenieClient): Promise<void> {
    this.checkDate();
    const cancellableLLs = bookings.filter(
      (b: Booking): b is LightningLane => b.type === 'LL' && b.cancellable
    );
    for (const b of cancellableLLs) {
      this.experiencedExpIds[b.modifiable ? 'delete' : 'add'](b.id);
    }
    const oldExpIds = this.expIds;
    this.expIds = new Set(cancellableLLs.map(b => b.id));
    for (const id of oldExpIds) {
      if (this.expIds.has(id)) continue;
      const { ineligible } = await client.guests({ id, park: { id: '0' } });
      const limitReached = ineligible.some(
        g => g.ineligibleReason === 'EXPERIENCE_LIMIT_REACHED'
      );
      this.experiencedExpIds[limitReached ? 'add' : 'delete'](id);
    }
    localStorage.setItem(
      BOOKINGS_KEY,
      JSON.stringify({
        date: this.date,
        expIds: [...this.expIds],
        experiencedExpIds: [...this.experiencedExpIds],
      } as BookingTrackerData)
    );
  }

  protected checkDate() {
    const today = dateTimeStrings().date;
    if (this.date === today) return;
    this.date = today;
    this.expIds = new Set();
    this.experiencedExpIds = new Set();
  }
}
