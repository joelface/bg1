import { dateTimeStrings, splitDateTime } from '@/datetime';

import { AuthStore } from './auth/store';
import { avatarUrl } from './avatar';
import { ApiClient } from './client';
import {
  Drop,
  Experience as ExpData,
  ExperienceType,
  Park,
  ResortData,
} from './data';

const RESORT_TO_ITINERARY_API_NAME = {
  WDW: 'wdw-itinerary-api',
  DLR: 'dlr-itinerary-web-api',
} as const;

export interface Experience extends ExpData {
  park: Park;
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
    nextAvailableTime?: string;
  };
  virtualQueue?: {
    available: boolean;
    waitTime: number;
  };
  experienced?: boolean;
  drop?: boolean;
}

export type PlusExperience = Experience & Required<Pick<Experience, 'flex'>>;
export type IllExperience = Experience &
  Required<Pick<Experience, 'individual'>>;

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
  subtype?: string;
  id: string;
  name: string;
  start: Partial<DateTime> & Pick<DateTime, 'date'>;
  end?: Partial<DateTime>;
  cancellable?: boolean;
  modifiable?: boolean;
  guests: Guest[];
  choices?: Pick<Experience, 'id' | 'name' | 'park'>[];
  bookingId: string;
}

export interface ParkPass extends BaseBooking {
  type: 'APR';
  subtype?: undefined;
  park: Park;
  start: DateTime;
  cancellable?: undefined;
  modifiable?: undefined;
}

export interface LightningLane extends BaseBooking {
  type: 'LL';
  subtype: 'G+' | 'ILL' | 'MEP' | 'OTHER';
  park: Park;
  end: Partial<DateTime>;
  guests: EntitledGuest[];
}

export interface DasBooking extends BaseBooking {
  type: 'DAS';
  subtype: 'IN_PARK' | 'ADVANCE';
  park: Park;
  start: DateTime;
  modifiable?: undefined;
  guests: EntitledGuest[];
}

export interface Reservation extends BaseBooking {
  type: 'RES';
  subtype: 'DINING' | 'ACTIVITY';
  park: Partial<Park> & Pick<Park, 'id' | 'name'>;
  start: DateTime;
  end?: undefined;
  cancellable?: undefined;
  modifiable?: undefined;
}

export interface BoardingGroup extends BaseBooking {
  type: 'BG';
  subtype?: undefined;
  park: Park;
  boardingGroup: number;
  status: BoardingGroupItem['status'];
  start: DateTime;
  cancellable?: undefined;
  modifiable?: undefined;
}

export type Booking =
  | LightningLane
  | DasBooking
  | Reservation
  | BoardingGroup
  | ParkPass;

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
    redemptionsAllowed?: number;
  }[];
}

interface ReservationItem {
  id: string;
  type: 'DINING' | 'ACTIVITY';
  startDateTime: string;
  guests: { id: string }[];
  asset: string;
}

export interface BoardingGroupItem {
  id: string;
  type: 'VIRTUAL_QUEUE_POSITION';
  status: 'IN_PROGRESS' | 'SUMMONED' | 'EXPIRED' | 'RELEASED' | 'OTHER';
  startDateTime: string;
  boardingGroup: { id: number };
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
  items: (
    | FastPassItem
    | ReservationItem
    | BoardingGroupItem
    | { type: undefined }
  )[];
  profiles: { [id: string]: Profile };
}

export const FALLBACK_IDS = {
  WDW: { experience: '80010110', park: '80007944' },
  DLR: { experience: '353295', park: '330339' },
} as const;

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

export class GenieClient extends ApiClient {
  readonly maxPartySize = 12;
  nextBookTime: string | undefined;
  onUnauthorized = () => undefined;

  protected partyIds = new Set<string>();
  protected guestCache = new Map<
    string,
    { name: string; characterId: string }
  >();
  protected tracker: Public<BookingTracker>;
  protected primaryGuestId = '';

  constructor(
    data: ResortData,
    authStore: Public<AuthStore>,
    tracker?: Public<BookingTracker>
  ) {
    super(data, authStore);
    this.tracker = tracker ?? new BookingTracker();
  }

  setPartyIds(partyIds: string[]) {
    this.partyIds = new Set(partyIds);
  }

  async experiences(park: Park): Promise<Experience[]> {
    await this.primeGuestCache();
    const { data } = await this.request<ExperiencesResponse>({
      path: `/tipboard-vas/api/v1/parks/${encodeURIComponent(
        park.id
      )}/experiences`,
      params: { eligibilityGuestIds: [...this.guestCache.keys()].join(',') },
    });
    this.nextBookTime = (data.eligibility?.flexEligibilityWindows || []).sort(
      (a, b) => a.time.time.localeCompare(b.time.time)
    )[0]?.time.time;
    const { experiences: dropExps = [] } = this.upcomingDrops(park)[0] ?? {};
    return data.availableExperiences
      .filter(exp => {
        const expData = this.data.experiences[exp.id];
        if (expData) return true;
        if (expData !== null) console.warn(`Missing experience: ${exp.id}`);
        return false;
      })
      .map(exp => ({
        ...exp,
        ...(this.data.experiences[exp.id] as ExpData),
        park,
        experienced: this.tracker.experienced(exp),
        drop: !!dropExps.find(({ id }) => id === exp.id),
      }));
  }

  async guests(experience?: {
    id: string;
    park?: { id: string };
  }): Promise<Guests> {
    const ids = FALLBACK_IDS[this.data.resort];
    const { data } = await this.request<GuestsResponse>({
      path: '/ea-vas/api/v1/guests',
      params: {
        productType: 'FLEX',
        experienceId: experience?.id ?? ids.experience,
        parkId: experience?.park?.id ?? ids.park,
      },
    });
    this.primaryGuestId = data.primaryGuestId;
    const ineligible = data.ineligibleGuests.map(this.convertGuest);
    const eligible = data.guests
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
    const {
      data: {
        offer: { id, date, startTime, endTime, status, changeStatus },
        eligibleGuests,
        ineligibleGuests,
      },
    } = await this.request<OfferResponse>({
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
              date: dateTimeStrings().date,
              modificationType:
                experience.id === bookingToModify.id ? 'TIME' : 'EXPERIENCE',
            }
          : {}),
      },
      userId: false,
    });
    import('./diu'); // preload
    return {
      id,
      start: { date, time: startTime },
      end: { date, time: endTime },
      active: status === 'ACTIVE',
      changed: changeStatus !== 'NONE',
      guests: {
        eligible: (eligibleGuests || []).map(this.convertGuest),
        ineligible: (ineligibleGuests || []).map(this.convertGuest),
      },
      experience,
    };
  }

  async book(
    offer: Pick<Offer, 'id' | 'guests' | 'experience'>,
    bookingToModify?: LightningLane,
    guestsToModify?: Pick<Guest, 'id'>[]
  ): Promise<LightningLane> {
    throwOnNotModifiable(bookingToModify);
    const diu = (await import('./diu')).default;
    const guestIdsToModify = new Set(
      (guestsToModify ?? offer.guests.eligible).map(g => g.id)
    );
    const { data } = await this.request<NewBookingResponse>({
      path: bookingToModify
        ? '/ea-vas/api/v2/products/modifications/flex/bookings'
        : '/ea-vas/api/v2/products/flex/bookings',
      method: 'POST',
      userId: false,
      data: {
        offerId: offer.id,
        ...(await diu(offer.id)),
        ...(bookingToModify
          ? {
              date: dateTimeStrings().date,
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
    const {
      singleExperienceDetails: { experienceId, parkId },
      entitlements,
      startDateTime,
      endDateTime,
    }: NewBookingResponse = data;
    return {
      type: 'LL',
      subtype: 'G+',
      ...this.getExperience(experienceId, parkId),
      bookingId: entitlements[0]?.id,
      start: splitDateTime(startDateTime),
      end: splitDateTime(endDateTime),
      cancellable: true,
      modifiable: false,
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

  async cancelBooking(guests: EntitledGuest[]): Promise<void> {
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
    const today = dateTimeStrings().date;
    const itineraryApiName = RESORT_TO_ITINERARY_API_NAME[this.data.resort];
    const {
      data: { items = [], assets = {}, profiles = {} },
    } = await this.request<Itinerary>({
      path: `/plan/${itineraryApiName}/api/v1/itinerary-items/${swid}?item-types=FASTPASS&item-types=DINING&item-types=ACTIVITY&item-types=VIRTUAL_QUEUE_POSITION`,
      params: {
        destination: this.data.resort,
        fields: 'items,profiles,assets',
        'guest-locators': swid + ';type=swid',
        'guest-locator-groups': 'MY_FAMILY',
        'start-date': today,
        'show-friends': 'false',
      },
      userId: false,
      ignoreUnauth: true,
    });

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

    const getReservation = (item: ReservationItem) => {
      const activityAsset = assets[item.asset];
      const facilityAsset = assets[activityAsset.facility];
      const parkIdStr = facilityAsset.location;
      if (!parkIdStr) return;
      const park = this.data.parks.get(idNum(parkIdStr)) || {
        id: parkIdStr,
        name: assets[parkIdStr].name,
      };
      const start = new Date(item.startDateTime);
      const res: Reservation = {
        type: 'RES',
        subtype: item.type,
        id: idNum(item.asset),
        park,
        name: activityAsset.name,
        start: dateTimeStrings(start),
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

    const getFastPass = (item: FastPassItem) => {
      const expAsset = assets[item.facility];
      const guestIds = new Set();
      return {
        ...this.getExperience(
          item.facility,
          (expAsset as Required<Asset>).location,
          expAsset.name
        ),
        start: {
          date: item.displayStartDate ?? today,
          time: item.displayStartTime,
        },
        end: {
          date: item.displayEndDate,
          time: item.displayEndTime,
        },
        guests: item.guests
          .filter(g => {
            if (guestIds.has(g.id)) return false;
            if (g.redemptionsRemaining === 0) return false;
            guestIds.add(g.id);
            return true;
          })
          .map(g => ({
            ...getGuest(g),
            entitlementId: g.entitlementId,
            bookingId: g.bookingId,
            ...(g.redemptionsRemaining !== undefined && {
              redemptions: Math.min(
                g.redemptionsRemaining,
                g.redemptionsAllowed ?? 1
              ),
            }),
          })),
        bookingId: item.id,
      };
    };

    const getLightningLane = (item: FastPassItem) => {
      const kindToSubtype: {
        [key: string]: LightningLane['subtype'] | undefined;
      } = {
        FLEX: 'G+',
        STANDARD: 'ILL',
        OTHER: 'OTHER',
      };
      const subtype = item.multipleExperiences
        ? 'MEP'
        : kindToSubtype[item.kind];
      if (!subtype) return;
      const isGeniePlus = subtype === 'G+';
      let booking: LightningLane = {
        type: 'LL',
        subtype,
        ...getFastPass(item),
        cancellable: item.cancellable && isGeniePlus,
        modifiable: item.modifiable && isGeniePlus,
        bookingId: item.id,
      };
      booking.modifiable = isModifiable(booking);
      if (item.multipleExperiences) {
        const origAsset = item.assets.find(a => a.original);
        if (origAsset) {
          booking = {
            ...booking,
            ...this.getExperience(
              origAsset.content,
              (assets[origAsset.content] as Required<Asset>).location
            ),
          };
        }
        booking.choices = item.assets
          .filter(a => !a.excluded && !a.original)
          .map(({ content }) => {
            const { name, location } = assets[content] as Required<Asset>;
            return this.getExperience(content, location, name);
          })
          .sort((a, b) => a.name.localeCompare(b.name));
      }
      return booking;
    };

    const getDasSelection = (item: FastPassItem): DasBooking => {
      const kindToSubtype = { DAS: 'IN_PARK', FDS: 'ADVANCE' } as const;
      const subtype = kindToSubtype[item.kind as 'DAS' | 'FDS'];
      const inPark = subtype === 'IN_PARK';
      return {
        type: 'DAS',
        subtype,
        cancellable: item.cancellable && inPark,
        ...(getFastPass(item) as ReturnType<typeof getFastPass> & {
          start: DasBooking['start'];
        }),
      };
    };

    const getBoardingGroup = (item: BoardingGroupItem): BoardingGroup => {
      const vqAsset = assets[item.asset];
      const facilityAsset = assets[vqAsset.facility];
      return {
        type: 'BG',
        ...this.getExperience(
          vqAsset.facility,
          (facilityAsset as Required<Asset>).location,
          vqAsset.name
        ),
        boardingGroup: item.boardingGroup.id,
        status: item.status,
        start: dateTimeStrings(new Date(item.startDateTime)),
        guests: item.guests.map(getGuest),
        bookingId: item.id,
      };
    };

    const getParkPass = (item: FastPassItem): ParkPass | undefined => {
      const park = this.data.parks.get(
        idNum((assets[item.facility] as Required<Asset>).location)
      );
      if (!park) return;
      return {
        type: 'APR',
        id: park.id,
        name: park.name,
        park,
        start: dateTimeStrings(new Date(item.startDateTime as string)),
        guests: item.guests.map(getGuest),
        bookingId: item.id,
      };
    };

    const kindToFunc: {
      [key: string]:
        | ((item: FastPassItem) => ParkPass | undefined)
        | ((item: FastPassItem) => DasBooking)
        | undefined;
    } = {
      PARK_PASS: getParkPass,
      DAS: getDasSelection,
      FDS: getDasSelection,
    };
    const bookings = items
      .map(item => {
        try {
          if (item.type === 'FASTPASS') {
            return (kindToFunc[item.kind] ?? getLightningLane)(item);
          } else if (item.type === 'VIRTUAL_QUEUE_POSITION') {
            return getBoardingGroup(item);
          } else if (item.type && RES_TYPES.has(item.type)) {
            return getReservation(item);
          }
        } catch (error) {
          console.error(error);
        }
      })
      .filter((booking): booking is Booking => !!booking);

    this.tracker.update(bookings, this);
    return bookings;
  }

  upcomingDrops(park: Pick<Park, 'id'>): Drop[] {
    const now = dateTimeStrings().time.slice(0, 5);
    const drops = this.data.drops[park.id] ?? [];
    const idx = drops.findIndex(({ time }) => time >= now);
    return idx >= 0 ? drops.slice(idx) : [];
  }

  nextDropTime(park: Pick<Park, 'id'>): string | undefined {
    return this.upcomingDrops(park)[0]?.time;
  }

  protected getExperience(id: string, parkId: string, name?: string) {
    id = idNum(id);
    return {
      id,
      name: (this.data.experiences[id]?.name || name) as string,
      park: this.data.parks.get(idNum(parkId)) as Park,
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

  protected async request<T>(
    request: Parameters<ApiClient['request']>[0] & { userId?: boolean }
  ) {
    if (request.userId ?? true) {
      const { swid } = this.authStore.getData();
      request = { ...request };
      request.params = { ...request.params, userId: swid };
    }
    return super.request<T>(request);
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
      (b: Booking): b is LightningLane => b.type === 'LL' && !!b.cancellable
    );
    for (const b of cancellableLLs) {
      this.experiencedExpIds[b.modifiable ? 'delete' : 'add'](b.id);
    }
    const oldExpIds = this.expIds;
    this.expIds = new Set(cancellableLLs.map(b => b.id));
    for (const id of oldExpIds) {
      if (this.expIds.has(id)) continue;
      const { ineligible } = await client.guests({ id });
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
