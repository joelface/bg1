import { splitDateTime } from '@/datetime';

import { authStore } from './auth';
import { avatarUrl } from './avatar';
import { ApiClient } from './client';
import { DasBooking } from './itinerary';
import { ExperienceType, Park } from './resort';

export type { DasBooking };

export interface Experience {
  id: string;
  name: string;
  type: ExperienceType;
  available: boolean;
  time: string;
}

interface ApiExperience extends Omit<Experience, 'time'> {
  nextAvailableStartDateTime?: string;
  nextAvailableEndDateTime?: string;
}

export interface Guest {
  id: string;
  name: string;
  avatarImageUrl?: string;
  characterId?: string;
}

export type DasParty = {
  primaryGuest: Guest;
  linkedGuests: Guest[];
  selectionLimit: number;
};

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

interface NewSelectionResponse {
  id: string;
  startDateTime: string;
  endDateTime: string;
  entitlements: {
    id: string;
    guestId: string;
  }[];
  singleExperienceDetails: {
    experienceId: string;
    parkId: string;
  };
}

interface EntitledGuest extends Omit<Guest, 'primary'> {
  entitlementId: string;
}

const path = (subpath: string, v: number) => `/das-vas/api/v${v}/${subpath}`;

function convertGuest(guest: Guest): Guest {
  return {
    id: guest.id,
    name: guest.name.replace(/ \(Me\)$/, ''),
    avatarImageUrl: avatarUrl(guest.characterId),
  };
}

function guestIdParams(primaryGuest: Guest, guests: Guest[]) {
  return {
    primaryGuestId: primaryGuest.id,
    guestIds: guests.map(g => g.id).join(','),
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
      path: path(`availability/parks/${parkId}/experiences`, 2),
      key: 'experiences',
    });
    return experiences
      .filter(
        (exp): exp is Required<ApiExperience> =>
          exp.available && !!exp.nextAvailableStartDateTime
      )
      .map(({ id, name, type, available, nextAvailableStartDateTime }) => {
        const { time } = splitDateTime(nextAvailableStartDateTime);
        try {
          return { type, ...this.resort.experience(id), available, time };
        } catch {
          return { id, name, type, available, time };
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async parties(): Promise<DasParty[]> {
    const { swid } = authStore.getData();
    encodeURIComponent(swid);
    const {
      data: { bookingGuestId, parties },
    } = await this.request<{
      bookingGuestId: string;
      parties: DasParty[];
    }>({
      path: path(`users/${encodeURIComponent(swid)}/parties`, 1),
    });
    this.bookingGuestId = bookingGuestId;
    return parties.map(p => ({
      primaryGuest: convertGuest(p.primaryGuest),
      linkedGuests: p.linkedGuests.map(convertGuest),
      selectionLimit: p.selectionLimit,
    }));
  }

  async book({
    park,
    experience,
    primaryGuest,
    guests,
  }: {
    park: Park;
    experience: Pick<Experience, 'id' | 'name'>;
    primaryGuest: Guest;
    guests: Guest[];
  }): Promise<DasBooking> {
    const eligibility = await this.eligibility({
      park,
      experience,
      primaryGuest,
      guests,
    });
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
    const guestsById = new Map(guests.map(g => [g.id, g]));
    const { data: booking } = await this.request<NewSelectionResponse>({
      path: path('bookings', 2),
      key: 'booking',
      data: {
        bookingGuestId: this.bookingGuestId,
        primaryGuestId: primaryGuest.id,
        guestIds: guests.map(g => g.id),
        experienceId: experience.id,
        ...(await this.availability({ experience, primaryGuest, guests })),
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
      path: path(`entitlements/${idParam}`, 1),
      method: 'DELETE',
    });
  }

  protected async eligibility({
    park,
    experience,
    primaryGuest,
    guests,
  }: {
    park: Park;
    experience: Pick<Experience, 'id'>;
    primaryGuest: Guest;
    guests: Guest[];
  }): Promise<EligibilityResponse> {
    const { data: eligibility } = await this.request<EligibilityResponse>({
      path: path('eligibility', 1),
      params: {
        experienceId: experience.id,
        parkId: park.id,
        ...guestIdParams(primaryGuest, guests),
      },
      key: 'eligibility',
    });
    return eligibility;
  }

  protected async availability({
    experience,
    primaryGuest,
    guests,
  }: {
    experience: Pick<Experience, 'id'>;
    primaryGuest: Guest;
    guests: Guest[];
  }): Promise<{
    startDateTime: string;
    endDateTime: string;
  }> {
    const expId = encodeURIComponent(experience.id);
    const {
      data: { startDateTime, endDateTime },
    } = await this.request<{ startDateTime: string; endDateTime: string }>({
      path: path(`availability/experiences/${expId}`, 3),
      params: guestIdParams(primaryGuest, guests),
    });
    if (!startDateTime || !endDateTime) throw new ExperienceUnavailable();
    return { startDateTime, endDateTime };
  }
}
