import { splitDateTime } from '@/datetime';

import { avatarUrl } from './avatar';
import { ApiClient } from './client';
import { ExperienceType, Park } from './resort';

interface ApiExperience {
  id: string;
  name: string;
  type: ExperienceType;
  available: boolean;
  nextAvailableTime?: string;
}

export type Experience = Required<ApiExperience>;

export interface Guest {
  id: string;
  name: string;
  primary?: boolean;
  avatarImageUrl?: string;
}

interface ApiGuest extends Omit<Guest, 'avatarImageUrl'> {
  characterId: string;
}

interface ApiParty {
  primaryGuest: ApiGuest;
  linkedGuests: ApiGuest[];
  selectionLimit: number;
}

type PartiesResponse = {
  bookingGuestId: string;
  parties: ApiParty[];
};

export type DasParty = Guest[];

interface EligibilityConflictSet {
  type:
    | 'PRIMARY_GUEST_NOT_ELIGIBLE'
    | 'PRODUCT_TYPE_LIMIT_REACHED'
    | 'NOT_IN_PARK';
  guestIds: string[];
}

export interface EligibilityConflicts {
  [guestId: string]: EligibilityConflictSet['type'] | undefined;
}

type EligibilityResponse = (
  | {
      type: 'ELIGIBLE';
      guestIds: string[];
    }
  | EligibilityConflictSet
)[];

type AvailabilityResponse = Omit<Experience, 'name'>;

interface NewSelectionResponse {
  id: string;
  assignmentDetails: {
    product: 'DISABILITY_ACCESS_SERVICE';
    reason: 'DISABILITY_ACCESS';
  };
  startDateTime: string;
  endDateTime: string;
  entitlements: {
    id: string;
    guestId: string;
    usageDetails: {
      status: 'BOOKED';
      modifiable: false;
      redeemable: boolean;
    };
  }[];
  singleExperienceDetails: {
    experienceId: string;
    parkId: string;
  };
}

interface EntitledGuest extends Omit<Guest, 'primary'> {
  entitlementId: string;
}

interface DateTime {
  date: string;
  time: string;
}

export interface DasBooking {
  type: 'DAS';
  subtype: 'IN_PARK';
  id: string;
  name: string;
  park: Park;
  guests: EntitledGuest[];
  start: DateTime;
  end: Partial<DateTime>;
  bookingId: string;
}

const path = (subpath: string) => `/das-vas/api/v1/${subpath}`;

function convertGuest(guest: ApiGuest): Guest {
  return {
    id: guest.id,
    name: guest.name.replace(/ \(Me\)$/, ''),
    avatarImageUrl: avatarUrl(guest.characterId),
    primary: guest.primary,
  };
}

export class ConflictsError extends Error {
  readonly name = 'ConflictsError';

  constructor(readonly conflicts: EligibilityConflicts) {
    super();
  }
}

export class NoPrimaryGuest extends Error {
  readonly name = 'NoPrimaryGuest';
}

export class ExperienceUnavailable extends Error {
  readonly name = 'ExperienceUnavailable';
}

export class DasClient extends ApiClient {
  protected bookingGuestId: string | undefined;
  #parties: DasParty[] | undefined;

  async experiences(park: Park): Promise<Experience[]> {
    const parkId = encodeURIComponent(park.id);
    const { data: experiences } = await this.request<ApiExperience[]>({
      path: path(`availability/parks/${parkId}/experiences`),
      key: 'experiences',
    });
    return experiences
      .filter(
        (exp): exp is Experience => exp.available && !!exp.nextAvailableTime
      )
      .map(exp => {
        try {
          return { ...exp, ...this.resort.experience(exp.id) };
        } catch {
          return exp;
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async parties(): Promise<DasParty[]> {
    const { swid } = this.authStore.getData();
    encodeURIComponent(swid);
    const {
      data: { bookingGuestId, parties },
    } = await this.request<PartiesResponse>({
      path: path(`users/${encodeURIComponent(swid)}/parties`),
    });
    this.bookingGuestId = bookingGuestId;
    return parties.map(p =>
      [{ ...p.primaryGuest, primary: true }, ...p.linkedGuests].map(
        convertGuest
      )
    );
  }

  async book({
    park,
    experience,
    guests,
  }: {
    park: Park;
    experience: Pick<Experience, 'id' | 'name'>;
    guests: Guest[];
  }): Promise<DasBooking> {
    const eligibility = await this.eligibility({ park, experience, guests });
    const eligibleIds = new Set(
      eligibility.find(({ type }) => type === 'ELIGIBLE')?.guestIds
    );
    if (!guests.every(g => eligibleIds.has(g.id))) {
      throw new ConflictsError(
        Object.fromEntries(
          eligibility
            .filter((c): c is EligibilityConflictSet => c.type !== 'ELIGIBLE')
            .flatMap(c => c.guestIds.map(id => [id, c.type]))
        )
      );
    }
    const startTime = await this.availability({ park, experience });
    const primaryGuestId = guests.find(g => g.primary)?.id;
    const guestsById = new Map(guests.map(g => [g.id, g]));
    const { data: booking } = await this.request<NewSelectionResponse>({
      path: path('bookings'),
      key: 'booking',
      data: {
        bookingGuestId: this.bookingGuestId,
        primaryGuestId,
        guestIds: guests.map(g => g.id),
        experienceId: experience.id,
        startTime,
      },
    });
    return {
      type: 'DAS',
      subtype: 'IN_PARK',
      id: experience.id,
      name: experience.name,
      park,
      guests: booking.entitlements.map(e => {
        const g = guestsById.get(e.guestId);
        return {
          id: e.guestId,
          name: g?.name ?? '',
          avatarImageUrl: g?.avatarImageUrl,
          entitlementId: e.id,
        };
      }),
      start: splitDateTime(booking.startDateTime),
      end: {},
      bookingId: booking.id,
    };
  }

  async cancelBooking(guests: EntitledGuest[]): Promise<void> {
    const ids = guests.map(g => g.entitlementId);
    const idParam = ids.map(encodeURIComponent).join(',');
    await this.request({
      path: path(`entitlements/${idParam}`),
      method: 'DELETE',
    });
  }

  protected async eligibility({
    park,
    experience,
    guests,
  }:
    | {
        park: Park;
        experience: Pick<Experience, 'id'>;
        guests: Guest[];
      }
    | Record<string, never> = {}): Promise<EligibilityResponse> {
    const primary = guests.find(g => !!g.primary);
    if (!primary) throw new NoPrimaryGuest();

    const { data: eligibility } = await this.request<EligibilityResponse>({
      path: path('eligibility'),
      params: {
        experienceId: experience.id,
        parkId: park.id,
        primaryGuestId: primary.id,
        guestIds: guests.map(g => g.id).join(','),
      },
      key: 'eligibility',
    });
    return eligibility;
  }

  protected async availability({
    park,
    experience,
  }: {
    park: Park;
    experience: Pick<Experience, 'id'>;
  }) {
    const expId = encodeURIComponent(experience.id);
    const parkId = encodeURIComponent(park.id);
    const {
      data: { available, nextAvailableTime },
    } = await this.request<AvailabilityResponse>({
      path: path(`availability/parks/${parkId}/experiences/${expId}`),
      key: 'experience',
    });
    if (!available || !nextAvailableTime) throw new ExperienceUnavailable();
    return nextAvailableTime;
  }
}
