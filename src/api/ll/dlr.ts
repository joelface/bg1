import { DateTime, ParkTime, parkDate } from '@/datetime';

import {
  ApiGuest,
  Guest,
  Guests,
  GuestsResponse,
  LLClient,
  LLMP,
  Offer,
  OfferError,
  OfferExperience,
  throwOnNotModifiable,
} from '../ll';
import { Park } from '../resort';

const FALLBACK_EXP_ID = '353295';
const FALLBACK_PARK_ID = '330339';

interface OfferResponse {
  offer: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'ACTIVE' | 'DELETED';
  };
  eligibleGuests: ApiGuest[];
  ineligibleGuests: ApiGuest[];
}

export interface BookingResponse {
  id: 'NEW_BOOKING' | 'MODIFIED_BOOKING';
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

export class LLClientDLR extends LLClient {
  async experiences(park: Park) {
    return super.experiences(park, parkDate());
  }

  async guests(experience?: { id: string }): Promise<Guests> {
    const { data } = await this.request<GuestsResponse>({
      path: '/ea-vas/api/v1/guests',
      params: {
        productType: 'FLEX',
        experienceId: experience?.id ?? FALLBACK_EXP_ID,
        parkId: experience
          ? this.resort.experience(experience.id).park.id
          : FALLBACK_PARK_ID,
      },
      userId: true,
    });
    return this.parseGuestData(data);
  }

  async offer<B extends Offer['booking']>(
    experience: OfferExperience,
    guests: Guest[],
    { booking }: { booking?: B } = {}
  ): Promise<Offer<B>> {
    throwOnNotModifiable(booking);
    const { nextAvailableTime } = experience.flex ?? {};
    const {
      data: {
        offer: { id, date, startTime, endTime, status },
        eligibleGuests,
        ineligibleGuests,
      },
    } = await this.request<OfferResponse>({
      path: booking
        ? '/ea-vas/api/v1/products/modifications/flex/offers'
        : '/ea-vas/api/v2/products/flex/offers',
      data: {
        guestIds: (booking?.guests ?? guests).map(g => g.id),
        ineligibleGuests: [],
        primaryGuestId: guests
          .map(g => g.id)
          .sort((a, b) => a.localeCompare(b))[0],
        parkId: experience.park.id,
        experienceId: experience.id,
        selectedTime: nextAvailableTime ?? '08:00:00',
        ...(booking
          ? {
              date: DateTime.now().date,
              modificationType:
                experience.id === booking.experience.id ? 'TIME' : 'EXPERIENCE',
            }
          : {}),
      },
    });
    const party = {
      eligible: (eligibleGuests || []).map(this.convertGuest),
      ineligible: (ineligibleGuests || []).map(this.convertGuest),
    };
    if (status !== 'ACTIVE') throw new OfferError(party);
    return this.updateLastOffer(
      {
        id,
        start: new DateTime(date, ParkTime.from(startTime)),
        end: new DateTime(date, ParkTime.from(endTime)),
        booking: booking as B,
        guests: party,
        experience,
        itinerary: [],
      },
      nextAvailableTime
    );
  }

  async times() {
    return [];
  }

  async changeOfferTime<B extends Offer['booking']>(offer: Offer<B>) {
    return offer;
  }

  async book(
    offer: Offer,
    guestsToModify?: Pick<Guest, 'id'>[]
  ): Promise<LLMP> {
    const diu = await (async () => {
      try {
        return (await import(/* @vite-ignore */ '../diu')).default;
      } catch {
        return async () => ({});
      }
    })();
    const guestsById = new Map(offer.guests.eligible.map(g => [g.id, g]));
    const guestIdsToModify = new Set(
      (guestsToModify ?? offer.guests.eligible).map(g => g.id)
    );
    const { data } = await this.request<BookingResponse>({
      path: offer.booking
        ? '/ea-vas/api/v2/products/modifications/flex/bookings'
        : '/ea-vas/api/v2/products/flex/bookings',
      data: {
        offerId: offer.id,
        ...(await diu(offer.id)),
        ...(offer.booking
          ? {
              date: DateTime.now().date,
              modificationType:
                offer.booking.experience.id === offer.experience.id
                  ? 'TIME'
                  : 'EXPERIENCE',
              existingEntitlements: offer.booking.guests
                .filter(g => guestIdsToModify.has(g.id))
                .map(g => ({
                  entitlementId: g.entitlementId,
                  entitlementBookingId: g.bookingId,
                })),
              guestIdsToExclude: offer.booking.guests
                .filter(g => !guestIdsToModify.has(g.id))
                .map(g => g.id),
            }
          : {}),
      },
      key: 'booking',
    });
    const {
      singleExperienceDetails: { experienceId },
      entitlements,
      startDateTime,
      endDateTime,
    }: BookingResponse = data;
    const { id, name, park } = this.resort.experience(experienceId);
    return {
      facilityId: id,
      name,
      experience: offer.experience,
      land: offer.experience.land,
      park,
      type: 'LL',
      subtype: 'MP',
      id: entitlements[0]!.id,
      start: DateTime.from(startDateTime),
      end: DateTime.from(endDateTime),
      cancellable: true,
      modifiable: true,
      guests: entitlements.map(e => ({
        id: e.guestId,
        name: 'Guest',
        ...guestsById.get(e.guestId),
        entitlementId: e.id,
      })),
    };
  }
}
