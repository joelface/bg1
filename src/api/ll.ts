import { DateTime, parkDate } from '@/datetime';
import kvdb from '@/kvdb';

import { authStore } from './auth';
import { avatarUrl } from './avatar';
import { ApiClient } from './client';
import { Booking, LightningLane, isType } from './itinerary';
import {
  Experience as ExpData,
  ExperienceType,
  InvalidId,
  Park,
  Resort,
} from './resort';

export type { LightningLane };

interface ApiExperience {
  id: string;
  type: ExperienceType;
  standby: {
    available?: boolean;
    unavailableReason?:
      | 'TEMPORARILY_DOWN'
      | 'NOT_STANDBY_ENABLED'
      | 'NO_MORE_SHOWS';
    waitTime?: number;
    nextShowTime?: string;
  };
  additionalShowTimes?: string[];
  flex?: {
    available?: boolean;
    nextAvailableTime?: string;
    enrollmentStartTime?: string;
  };
  individual?: {
    available: boolean;
    displayPrice: string;
    nextAvailableTime?: string;
  };
  virtualQueue?: {
    available: boolean;
    nextAvailableTime?: string;
  };
}

export type Experience = ExpData & ApiExperience & { experienced?: boolean };
export type FlexExperience = Experience & Required<Pick<Experience, 'flex'>>;

interface ExperiencesResponse {
  availableExperiences: ApiExperience[];
  eligibility?: {
    geniePlusEligibility?: {
      [date: string]: {
        flexEligibilityWindows?: {
          time: {
            time: string;
            timeDisplayString: string;
            timeStatus: 'NOW' | 'LATER';
          };
          guestIds: string[];
        }[];
      };
    };
    guestIds: string[];
  };
}

export type IneligibleReason =
  | 'INVALID_PARK_ADMISSION'
  | 'PARK_RESERVATION_NEEDED'
  | 'GENIE_PLUS_NEEDED'
  | 'EXPERIENCE_LIMIT_REACHED'
  | 'TOO_EARLY'
  | 'TOO_EARLY_FOR_PARK_HOPPING'
  | 'NOT_IN_PARTY'
  | 'MULTI_PASS_NEEDED'
  | 'REDEMPTION_NEEDED'
  | 'TIER_LIMIT_REACHED'
  | 'TOO_EARLY_FOR_NEXT_PARK';

interface GuestEligibility {
  ineligibleReason?: IneligibleReason;
  eligibleAfter?: string;
}

export interface OrderDetails {
  externalIdentifier: {
    id: string;
    idType: string;
  };
  orderId: string;
  orderItemId: string;
}

export interface Guest extends GuestEligibility {
  id: string;
  name: string;
  primary?: boolean;
  avatarImageUrl?: string;
  transactional?: boolean;
  orderDetails?: OrderDetails;
}

export interface Guests {
  eligible: Guest[];
  ineligible: Guest[];
}

export interface ApiGuest extends GuestEligibility {
  id: string;
  firstName: string;
  lastName: string;
  primary?: boolean;
  characterId?: string;
  orderDetails?: OrderDetails;
}

export interface GuestsResponse {
  guests: ApiGuest[];
  ineligibleGuests: ApiGuest[];
}

export type OfferExperience = Pick<Experience, 'id' | 'name' | 'park' | 'flex'>;

export interface Offer<B = LightningLane | undefined> {
  id: string;
  start: DateTime;
  end: DateTime;
  active: boolean;
  changed: boolean;
  guests: {
    eligible: Guest[];
    ineligible: Guest[];
  };
  experience: OfferExperience;
  offerSetId?: string;
  booking: B;
}

export interface Slot {
  startTime: string;
  endTime: string;
}

export type HourlySlots = Slot[][];

export const FALLBACK_EXPS = {
  WDW: { id: '80010110', park: { id: '80007944' } },
  DLR: { id: '353295', park: { id: '330339' } },
} as const;

export class ModifyNotAllowed extends Error {
  name = 'ModifyNotAllowed';
}

export function throwOnNotModifiable(booking?: Booking) {
  if (booking && !booking.modifiable) {
    throw new ModifyNotAllowed();
  }
}

function compareByReason(a: Guest, b: Guest, reason: IneligibleReason) {
  return +(b.ineligibleReason === reason) - +(a.ineligibleReason === reason);
}

export abstract class LLClient extends ApiClient {
  readonly rules = {
    maxPartySize: 12,
    parkModify: false,
    prebook: false,
    timeSelect: false,
  };
  nextBookTime: string | undefined;
  onUnauthorized = () => undefined;

  protected partyIds = new Set<Guest['id']>();
  protected tracker: Public<LLTracker>;
  #primaryGuestId = '';

  constructor(resort: Resort, tracker?: Public<LLTracker>) {
    super(resort);
    this.tracker = tracker ?? new LLTracker();
  }

  setPartyIds(partyIds: string[]) {
    this.partyIds = new Set(partyIds);
  }

  async experiences(park: Park, date: string): Promise<Experience[]> {
    const { data } = await this.request<ExperiencesResponse>({
      path: `/tipboard-vas/planning/v1/parks/${encodeURIComponent(
        park.id
      )}/experiences/`,
      params: {
        eligibilityGuestIds: await this.primaryGuestId(),
        date,
      },
      userId: true,
    });
    this.nextBookTime = (
      data.eligibility?.geniePlusEligibility?.[parkDate()]
        ?.flexEligibilityWindows || []
    ).sort((a, b) => a.time.time.localeCompare(b.time.time))[0]?.time.time;
    return data.availableExperiences.flatMap(exp => {
      try {
        return [
          {
            ...exp,
            ...this.resort.experience(exp.id),
            park,
            experienced: this.tracker.experienced(exp),
          },
        ];
      } catch (error) {
        if (error instanceof InvalidId) return [];
        throw error;
      }
    });
  }

  track(bookings: Booking[]) {
    this.tracker.update(bookings, this);
  }

  abstract guests(experience?: { id: string }, date?: string): Promise<Guests>;

  abstract offer<B extends Offer['booking']>(
    experience: OfferExperience,
    guests: Guest[],
    options?: { date: string } | { booking?: B }
  ): Promise<Offer<B>>;

  abstract times(offer: Offer): Promise<HourlySlots>;

  abstract changeOfferTime<B extends Offer['booking']>(
    offer: Offer<B>,
    slot: Slot
  ): Promise<Offer<B>>;

  abstract book<B extends Offer['booking']>(
    offer: Offer<B>,
    guestsToModify?: Pick<Guest, 'id'>[]
  ): Promise<LightningLane>;

  async cancelBooking(guests: LightningLane['guests']) {
    const ids = guests.map(g => g.entitlementId);
    const idParam = ids.map(encodeURIComponent).join(',');
    await this.request({
      path: `/ea-vas/api/v1/entitlements/${idParam}`,
      method: 'DELETE',
    });
  }

  protected convertGuest = <T extends ApiGuest>(
    guest: T
  ): Omit<T, 'id' | 'firstName' | 'lastName' | 'characterId'> & {
    id: string;
    name: string;
    avatarImageUrl?: string;
  } => {
    const { id, firstName, lastName, characterId, ...rest } = guest;
    const name = `${firstName ?? ''} ${lastName ?? ''}`.trim();
    const avatarImageUrl = avatarUrl(characterId);
    if (this.partyIds.size > 0 && !this.partyIds.has(id)) {
      rest.ineligibleReason = 'NOT_IN_PARTY';
      delete rest.eligibleAfter;
    }
    return { ...rest, id, name, avatarImageUrl };
  };

  protected async primaryGuestId() {
    if (!this.#primaryGuestId) {
      const { eligible, ineligible } = await this.guests();
      this.#primaryGuestId =
        [...eligible, ...ineligible].find(g => g.primary)?.id ?? '';
    }
    return this.#primaryGuestId;
  }

  protected async request<T>(
    request: Parameters<ApiClient['request']>[0] & { userId?: boolean }
  ) {
    if (request.userId) {
      const { swid } = authStore.getData();
      request = { ...request };
      request.params = { ...request.params, userId: swid };
    }
    return super.request<T>(request);
  }

  protected parseGuestData(response: GuestsResponse) {
    const { guests, ineligibleGuests } = response;
    const ineligible = ineligibleGuests.map(this.convertGuest);
    const eligible = guests
      .map(this.convertGuest)
      .filter(g => !g.ineligibleReason || (ineligible.push(g) && false));
    ineligible.sort((a, b) => {
      const cmp = +!a.primary - +!b.primary || a.name.localeCompare(b.name);
      if (a.eligibleAfter || b.eligibleAfter) {
        return (
          (a.eligibleAfter || '9').localeCompare(b.eligibleAfter || '9') || cmp
        );
      }
      if (a.ineligibleReason === b.ineligibleReason) return cmp;
      return (
        compareByReason(b, a, 'NOT_IN_PARTY') ||
        compareByReason(b, a, 'MULTI_PASS_NEEDED') ||
        compareByReason(a, b, 'EXPERIENCE_LIMIT_REACHED') ||
        cmp
      );
    });
    return { eligible, ineligible };
  }

  protected fallbackExperience(experience?: { id: string }) {
    return experience
      ? this.resort.experience(experience.id)
      : FALLBACK_EXPS[this.resort.id];
  }
}

export const BOOKINGS_KEY = ['bg1', 'll', 'bookings'];

interface LLTrackerData {
  booked: Experience['id'][];
  experienced: Experience['id'][];
}

export class LLTracker {
  protected bookedIds = new Set<Experience['id']>();
  protected experiencedIds = new Set<Experience['id']>();

  constructor() {
    this.load();
  }

  experienced(experience: Pick<Experience, 'id'>) {
    return this.experiencedIds.has(experience.id);
  }

  async update(bookings: Booking[], client: LLClient) {
    this.load();
    const parkDay = parkDate();
    const cancellableLLs = bookings.filter(
      (b: Booking) =>
        isType(b, 'LL', 'MP') &&
        !!b.cancellable &&
        parkDate(b.start) === parkDay
    );
    for (const b of cancellableLLs) {
      this.experiencedIds[b.modifiable ? 'delete' : 'add'](b.id);
    }
    const prevBookedIds = this.bookedIds;
    this.bookedIds = new Set(cancellableLLs.map(b => b.id));
    for (const id of prevBookedIds) {
      if (this.bookedIds.has(id)) continue;
      const { ineligible } = await client.guests({ id });
      const limitReached = ineligible.some(
        g => g.ineligibleReason === 'EXPERIENCE_LIMIT_REACHED'
      );
      this.experiencedIds[limitReached ? 'add' : 'delete'](id);
    }
    this.save();
  }

  protected load() {
    const { booked = [], experienced = [] } =
      kvdb.getDaily<LLTrackerData>(BOOKINGS_KEY) ?? {};
    this.bookedIds = new Set(booked);
    this.experiencedIds = new Set(experienced);
  }

  protected save() {
    kvdb.setDaily<LLTrackerData>(BOOKINGS_KEY, {
      booked: [...this.bookedIds],
      experienced: [...this.experiencedIds],
    });
  }
}
