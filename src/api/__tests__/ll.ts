import { expectFetch, respond, response } from '@/__fixtures__/client';
import {
  booking,
  bookings,
  donald,
  expiredLL,
  hm,
  ll,
  mickey,
  minnie,
  mk,
  modOffer,
  offer,
  omitOrderDetails,
  pluto,
  sm,
  times,
  wdw,
} from '@/__fixtures__/ll';
import kvdb from '@/kvdb';
import { TODAY, TOMORROW, setTime } from '@/testing';

import { RequestError } from '../client';
import { LLTracker, ModifyNotAllowed } from '../ll';
import { LLClientDLR } from '../ll/dlr';
import { LLClientWDW } from '../ll/wdw';

const diu = {
  disneyInternalUse01: '1',
  disneyInternalUse02: '2',
  disneyInternalUse03: '3',
};
jest.mock('../diu', () => ({ __esModule: true, default: () => diu }));
const onUnauthorized = jest.fn();

function apiGuest<T extends { name: string }>({
  name,
  ...rest
}: T): Omit<T, 'name'> {
  const [firstName, lastName = ''] = name.split(' ');
  return { ...rest, firstName, lastName };
}

const guests = [mickey, minnie, pluto];
const ineligibleGuests = [donald];

const tracker = {
  experienced: (exp: { id: string }) => exp.id === booking.id,
  update: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  setTime('10:00');
});

describe('LLClientWDW', () => {
  const client = new LLClientWDW(wdw, tracker);
  client.onUnauthorized = onUnauthorized;
  const guestsUrl = '/ea-vas/planning/api/v1/experiences/guest/guests';
  const guestsRes = response({
    guests: guests.map(apiGuest),
    ineligibleGuests: ineligibleGuests.map(g =>
      apiGuest({
        ...g,
        ineligibleReason: { ineligibleReason: g.ineligibleReason },
      })
    ),
  });

  describe('experiences()', () => {
    it('returns experience info', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(client, 'guests');
      const res = response({
        availableExperiences: [hm, sm, { id: 'not_a_real_id' }],
      });
      const getExpData = () => client.experiences(mk, TOMORROW);
      respond(guestsRes, res);
      expect(await getExpData()).toEqual([
        { ...hm, experienced: true },
        { ...sm, experienced: false },
      ]);
      expect(client.guests).toHaveBeenCalledTimes(1);
      expectFetch(
        `/tipboard-vas/planning/v1/parks/${encodeURIComponent(mk.id)}/experiences`,
        { params: { date: TOMORROW, eligibilityGuestIds: mickey.id } },
        true,
        2
      );

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenLastCalledWith(
        'Missing experience: not_a_real_id'
      );
      warn.mockRestore();
    });
  });

  describe('setPartyIds()', () => {
    it('sets booking party', async () => {
      client.setPartyIds([mickey.id, pluto.id]);
      respond(guestsRes);
      const { eligible, ineligible } = await client.guests();
      expect(eligible.map(g => g.id)).toEqual([mickey.id, pluto.id]);
      expect(ineligible.map(g => g.id)).toEqual([donald.id, minnie.id]);
      ineligible.forEach(g => expect(g.ineligibleReason).toBe('NOT_IN_PARTY'));
      client.setPartyIds([]);
    });
  });

  describe('guests()', () => {
    it('returns eligible & ineligible guests for experience', async () => {
      respond(guestsRes);
      expect(await client.guests(hm)).toEqual({
        eligible: [mickey, minnie, pluto],
        ineligible: ineligibleGuests,
      });
      expectFetch(guestsUrl, {
        data: {
          date: TODAY,
          facilityId: hm.id,
          parkId: mk.id,
        },
      });
    });

    it('includes avatarImageUrls when characterId exists', async () => {
      respond(
        response({
          guests: [
            { ...mickey, characterId: 19633995 },
            { ...minnie, characterId: 18405224 },
            { ...pluto, characterId: 90004625 },
          ].map(apiGuest),
          ineligibleGuests: [],
        })
      );
      expect(await client.guests(hm)).toEqual({
        eligible: [
          {
            ...mickey,
            avatarImageUrl:
              'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/90/90/75/dam/disney-world/50th-anniversary/avatars/RetAvatar_180x180_50th_Mickey.png',
          },
          {
            ...minnie,
            avatarImageUrl:
              'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/90/90/75/dam/wdpro-assets/avatars/180x180/RetAvatar-180x180-Moana.png',
          },
          {
            ...pluto,
            avatarImageUrl:
              'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/90/90/75/dam/wdpro-assets/avatars/180x180/RetAvatar_180x180_Pluto.png',
          },
        ],
        ineligible: [],
      });
    });

    it('treats any guests with ineligibleReason as ineligible', async () => {
      respond(
        response({
          guests: [donald].map(apiGuest),
          ineligibleGuests: [],
        })
      );
      expect(await client.guests(hm)).toEqual({
        eligible: [],
        ineligible: [donald],
      });
    });

    it('sorts ineligible guests', async () => {
      const fifi = {
        id: 'fifi',
        name: 'Fifi',
        ineligibleReason: 'TOO_EARLY',
        eligibleAfter: '10:30:00',
      };
      const goofy = {
        id: 'goofy',
        name: 'Goofy',
        ineligibleReason: 'EXPERIENCE_LIMIT_REACHED',
      };
      respond(
        response({
          guests: [],
          ineligibleGuests: [
            {
              ...minnie,
              ineligibleReason: 'TOO_EARLY',
              eligibleAfter: '10:30:00',
            },
            {
              ...pluto,
              ineligibleReason: 'TOO_EARLY',
              eligibleAfter: '10:00:00',
            },
            donald,
            fifi,
            goofy,
            {
              ...mickey,
              ineligibleReason: 'TOO_EARLY',
              eligibleAfter: '10:30:00',
              primary: true,
            },
          ].map(apiGuest),
        })
      );
      const { ineligible } = await client.guests(hm);
      expect(ineligible.map(g => g.id)).toEqual(
        [pluto, mickey, fifi, minnie, donald, goofy].map(g => g.id)
      );
    });
  });

  describe('offer()', () => {
    function offerSetResponse(times?: [string, string]) {
      const offerItem = {
        facilityId: offer.experience.id,
        type: 'OFFER_ITEM',
        offerId: offer.id,
        offerSetId: offer.offerSetId as string,
        offerType: 'FLEX',
        startDateTime: `${offer.start.date}T${times?.[0] ?? offer.start.time}`,
        endDateTime: `${offer.end.date}T${times?.[1] ?? offer.end.time}`,
        conflict: times ? 'ALTERNATIVE_TIME_FOUND' : undefined,
      };
      const offerSet = {
        itinerary: {
          items: [
            {
              type: 'EVENT_ITEM',
              eventType: 'PARK_OPEN',
              facilityId: '80007944',
              startDateTime: `${TODAY}T08:00:00`,
              endDateTime: `${TODAY}T08:00:00`,
            },
            offerItem,
            {
              type: 'EVENT_ITEM',
              eventType: 'PARK_CLOSE',
              facilityId: '80007944',
              startDateTime: `${TODAY}T22:00:00`,
              endDateTime: `${TODAY}T22:00:00`,
            },
          ],
        },
        party: {
          guests: offer.guests.eligible.map(apiGuest),
          ineligibleGuests: [],
        },
      };
      return response(offerSet);
    }

    const changeOfferTime = jest.spyOn(client, 'changeOfferTime');
    changeOfferTime.mockResolvedValueOnce(offer);

    afterAll(() => {
      changeOfferTime.mockRestore();
    });

    it('obtains Lightning Lane offer', async () => {
      respond(offerSetResponse());
      expect(await client.offer(hm, guests, { date: TOMORROW })).toEqual(offer);
      expectFetch('/ea-vas/planning/api/v1/experiences/offerset/generate', {
        data: {
          date: TOMORROW,
          guestIds: guests.map(g => g.id),
          parkId: mk.id,
          experienceIds: [hm.id],
          targetedTime: hm.flex.nextAvailableTime,
          ignoredBookedExperienceIds: null,
        },
      });
    });

    it('obtains offer to modify existing booking', async () => {
      respond(offerSetResponse());
      expect(await client.offer(sm, guests, { booking })).toEqual({
        ...offer,
        experience: sm,
        booking,
      });
      expectFetch('/ea-vas/planning/api/v1/experiences/mod/offerset/generate', {
        data: {
          date: booking.start.date,
          guestIds: guests.map(g => g.id),
          parkId: mk.id,
          experienceId: sm.id,
          originalExperienceId: hm.id,
          originalEntitlementIds: booking.guests.map(g => g.entitlementId),
          targetedTime: sm.flex.nextAvailableTime,
          ignoredBookedExperienceIds: null,
        },
      });
    });

    it('reports change', async () => {
      const slot: [string, string] = ['11:20:00', '12:20:00'];
      respond(offerSetResponse(slot));
      expect(
        await client.offer(hm, offer.guests.eligible, { date: TODAY })
      ).toEqual({
        ...offer,
        start: { date: TODAY, time: slot[0] },
        end: { date: TODAY, time: slot[1] },
        changed: true,
      });
      expect(client.changeOfferTime).toHaveBeenCalledTimes(0);
    });

    it('checks for earlier time if later than expected', async () => {
      respond(offerSetResponse(['11:25:00', '12:25:00']));
      expect(
        await client.offer(hm, offer.guests.eligible, { date: TODAY })
      ).toEqual(offer);
      expect(client.changeOfferTime).toHaveBeenCalledTimes(1);
    });

    it('returns original offer if changeOfferTime() fails', async () => {
      const error = jest.spyOn(console, 'error');
      error.mockImplementationOnce(() => {});
      changeOfferTime.mockReset().mockRejectedValueOnce('oops');
      respond(offerSetResponse(['11:25:00', '12:25:00']));
      expect(
        await client.offer(hm, offer.guests.eligible, { date: TODAY })
      ).toEqual({
        ...offer,
        start: { date: TODAY, time: '11:25:00' },
        end: { date: TODAY, time: '12:25:00' },
        changed: true,
      });
      expect(client.changeOfferTime).toHaveBeenCalled();
      expect(error).toHaveBeenCalledWith('oops');
    });

    it('throws ModifyNotAllowed when not allowed to modify', async () => {
      await expect(
        client.offer(hm, guests, {
          booking: { ...booking, modifiable: false },
        })
      ).rejects.toThrow(ModifyNotAllowed);
    });
  });

  describe('times()', () => {
    const timesRes = response({
      hourSegmentGroups: times.map(slots => ({
        inventorySlotsAvailability: slots,
      })),
    });
    const timesReq = {
      data: {
        date: TODAY,
        experienceId: hm.id,
        parkId: mk.id,
        offerId: offer.id,
        offerSetIds: [offer.offerSetId],
        offerType: 'FLEX',
        guestIds: offer.guests.eligible.map(g => g.id),
        experienceIdsToIgnore: [],
        originalOrderItemId: null,
      },
    };

    it('uses mod endpoint when modifying', async () => {
      respond(timesRes);
      expect(await client.times(modOffer)).toEqual(times);
      expectFetch(
        '/ea-vas/planning/api/v1/experiences/mod/offerset/times',
        timesReq
      );
    });
  });

  describe('changeOfferTime()', () => {
    const slot = { startTime: '15:00:00', endTime: '16:00:00' };
    const newOffer = {
      ...offer,
      id: 'changedOfferId',
      offerSetId: 'changedOfferSetId',
      start: { date: TODAY, time: slot.startTime },
      end: { date: TODAY, time: slot.endTime },
    };
    const changeRes = response({
      updatedPlanningOfferDisplayItem: {
        offerId: newOffer.id,
        offerSetId: newOffer.offerSetId,
        startDateTime: `${TODAY}T${slot.startTime}`,
        endDateTime: `${TODAY}T${slot.endTime}`,
      },
    });
    const changeReq = {
      data: {
        date: TODAY,
        guestIds: offer.guests.eligible.map(g => g.id),
        offerId: offer.id,
        offerSetIds: [offer.offerSetId],
        offerType: 'FLEX',
        parkId: mk.id,
        targetSlot: slot,
        experienceIdsToIgnore: [],
      },
    };

    it('changes offer time', async () => {
      respond(changeRes);
      expect(await client.changeOfferTime(offer, slot)).toEqual(newOffer);
      expectFetch(
        '/ea-vas/planning/api/v1/experiences/offerset/times/fulfill',
        changeReq
      );
    });

    it('specifies if time was changed', async () => {
      respond({
        ...changeRes,
        data: { ...changeRes.data, conflict: 'ALTERNATIVE_TIME_FOUND' },
      });
      expect(await client.changeOfferTime(offer, slot)).toEqual(newOffer);
    });

    it('uses mod endpoint when modifying', async () => {
      respond(changeRes);
      expect(await client.changeOfferTime(modOffer, slot)).toEqual({
        ...newOffer,
        booking,
      });
      expectFetch(
        '/ea-vas/planning/api/v1/experiences/mod/offerset/times/fulfill',
        {
          ...changeReq,
          data: {
            ...changeReq.data,
            offerSetId: offer.offerSetId,
            offerSetIds: undefined,
          },
        }
      );
    });
  });

  describe('book()', () => {
    it('books Lightning Lanes', async () => {
      respond(
        response({
          entitlementExperiences: [
            {
              experienceId: booking.id,
              startDateTime: `${booking.start.date}T${booking.start.time}`,
              endDateTime: `${booking.end.date}T${booking.end.time}`,
              guests: booking.guests.map(g => ({
                entitlementId: g.entitlementId,
                guestId: g.id,
              })),
            },
          ],
          party: {
            guests: booking.guests.map(apiGuest),
            ineligibleGuests: [],
          },
        })
      );
      expect(await client.book(offer)).toEqual(booking);
      expectFetch('/ea-vas/planning/api/v1/experiences/entitlements/book', {
        data: {
          offerSetId: offer.offerSetId,
          orderGuestDetails: guests.map(g => ({
            orderId: g.orderDetails.orderId,
            orderItemId: g.orderDetails.orderItemId,
            guestDetails: [
              {
                guestId: g.id,
                externalIdentifier: g.orderDetails.externalIdentifier,
              },
            ],
          })),
        },
      });
    });

    it('modifies an existing LL', async () => {
      const orderDetailsById = new Map(guests.map(g => [g.id, g.orderDetails]));
      const modGuests = booking.guests.slice(0, 2);
      respond(
        response({
          booking: {
            experienceId: booking.id,
            startDateTime: `${booking.start.date}T${booking.start.time}`,
            endDateTime: `${booking.end.date}T${booking.end.time}`,
            guests: modGuests.map(g => ({
              guestId: g.id,
              entitlementId: g.entitlementId,
            })),
          },
          party: {
            guests: modGuests.map(apiGuest),
            ineligibleGuests: [],
          },
        })
      );
      expect(await client.book(modOffer, modGuests)).toEqual({
        ...booking,
        guests: modGuests,
      });
      expectFetch('/ea-vas/planning/api/v1/experiences/mod/entitlements/book', {
        data: {
          offerSetId: modOffer.offerSetId,
          eligibleGuestsEntitlements: modGuests.map(g => ({
            guestId: g.id,
            entitlementId: g.entitlementId,
            ...orderDetailsById.get(g.id),
          })),
        },
      });
    });

    it('throws RequestError on failure', async () => {
      respond(response({}, 410));
      await expect(client.book(offer)).rejects.toThrow(RequestError);
    });
  });

  describe('cancelBooking()', () => {
    it('cancels booking', async () => {
      respond(response({}));
      await client.cancelBooking(booking.guests);
      expectFetch(
        `/ea-vas/api/v1/entitlements/${booking.guests
          .map(g => g.entitlementId)
          .join(',')}`,
        { method: 'DELETE' }
      );
    });
  });

  describe('track()', () => {
    it('updates LL tracker', async () => {
      client.track(bookings);
      expect(tracker.update).toHaveBeenCalledTimes(1);
    });
  });
});

describe('LLClientDLR', () => {
  const client = new LLClientDLR(wdw, tracker);
  client.onUnauthorized = onUnauthorized;
  const guestsRes = response({
    guests: guests.map(apiGuest),
    ineligibleGuests: ineligibleGuests.map(apiGuest),
  });

  describe('setPartyIds()', () => {
    it('sets booking party', async () => {
      client.setPartyIds([mickey.id, pluto.id]);
      respond(guestsRes);
      const { eligible, ineligible } = await client.guests();
      expect(eligible.map(g => g.id)).toEqual([mickey.id, pluto.id]);
      expect(ineligible.map(g => g.id)).toEqual([donald.id, minnie.id]);
      ineligible.forEach(g => expect(g.ineligibleReason).toBe('NOT_IN_PARTY'));
      client.setPartyIds([]);
    });
  });

  describe('guests()', () => {
    const guestsUrl = '/ea-vas/api/v1/guests';

    it('returns eligible & ineligible guests for experience', async () => {
      respond(guestsRes);
      expect(await client.guests(hm)).toEqual({
        eligible: [mickey, minnie, pluto],
        ineligible: ineligibleGuests,
      });
      expectFetch(
        guestsUrl,
        {
          params: {
            productType: 'FLEX',
            experienceId: hm.id,
            parkId: mk.id,
          },
        },
        true
      );
    });
  });

  describe('offer()', () => {
    const dlrOffer = { ...offer, offerSetId: undefined };
    const offerData = {
      id: offer.id,
      date: offer.start.date,
      startTime: offer.start.time,
      endTime: offer.end.time,
      status: 'ACTIVE',
      changeStatus: 'NONE',
    };

    it('obtains Lightning Lane offer', async () => {
      respond(
        response(
          {
            offer: offerData,
            eligibleGuests: offer.guests.eligible.map(apiGuest),
            ineligibleGuests: [],
          },
          201
        )
      );
      expect(await client.offer(hm, offer.guests.eligible)).toEqual(dlrOffer);
      expectFetch('/ea-vas/api/v2/products/flex/offers', {
        data: {
          guestIds: offer.guests.eligible.map(g => g.id),
          ineligibleGuests: [],
          primaryGuestId: mickey.id,
          parkId: mk.id,
          experienceId: hm.id,
          selectedTime: hm.flex.nextAvailableTime,
        },
      });
    });

    it('reports changes/failure', async () => {
      respond(
        response(
          {
            offer: { ...offerData, status: 'DELETED', changeStatus: 'CHANGED' },
            eligibleGuests: [],
            ineligibleGuests: offer.guests.eligible.map(g => ({
              ...apiGuest(g),
              ineligibleReason: 'TOO_EARLY_FOR_PARK_HOPPING',
            })),
          },
          201
        )
      );
      expect(await client.offer(hm, offer.guests.eligible)).toEqual({
        ...dlrOffer,
        active: false,
        changed: true,
        guests: {
          eligible: [],
          ineligible: offer.guests.eligible.map(g => ({
            ...g,
            ineligibleReason: 'TOO_EARLY_FOR_PARK_HOPPING',
          })),
        },
      });
    });

    it('throws ModifyNotAllowed when not allowed to modify', async () => {
      await expect(
        client.offer(hm, guests, {
          booking: { ...booking, modifiable: false },
        })
      ).rejects.toThrow(ModifyNotAllowed);
    });
  });

  describe('times()', () => {
    it('returns an empty array', async () => {
      expect(await client.times()).toEqual([]);
    });
  });

  describe('changeOfferTime()', () => {
    it('is a no-op', async () => {
      expect(await client.changeOfferTime(offer)).toBe(offer);
    });
  });

  describe('book()', () => {
    it('books Lightning Lanes', async () => {
      respond(
        response(
          {
            booking: {
              id: 'NEW_BOOKING',
              entitlements: booking.guests.map(g => ({
                id: g.entitlementId,
                guestId: g.id,
              })),
              startDateTime: `${booking.start.date}T${booking.start.time}`,
              endDateTime: `${booking.end.date}T${booking.end.time}`,
              singleExperienceDetails: {
                experienceId: booking.id,
                parkId: booking.park.id,
              },
            },
          },
          201
        )
      );
      expect(
        await client.book({
          ...offer,
          guests: {
            eligible: offer.guests.eligible.map(omitOrderDetails),
            ineligible: [],
          },
        })
      ).toEqual(booking);
      expectFetch('/ea-vas/api/v2/products/flex/bookings', {
        data: { offerId: offer.id, ...diu },
      });
    });

    it('throws RequestError on failure', async () => {
      respond(response({}, 410));
      await expect(client.book(offer)).rejects.toThrow(RequestError);
    });
  });
});

describe('LLTracker', () => {
  kvdb.clear();
  const tracker = new LLTracker();

  describe('update()', () => {
    it('updates tracking data', async () => {
      await tracker.update([expiredLL], ll);
      await tracker.update(bookings, ll);
      expect(tracker.experienced(booking)).toBe(false);
      expect(tracker.experienced(expiredLL)).toBe(true);

      ll.guests.mockResolvedValueOnce({
        eligible: [],
        ineligible: [
          { ...mickey, ineligibleReason: 'EXPERIENCE_LIMIT_REACHED' },
        ],
      });
      await tracker.update([expiredLL], ll);
      expect(tracker.experienced(booking)).toBe(true);
      expect(tracker.experienced(expiredLL)).toBe(true);
    });
  });
});
