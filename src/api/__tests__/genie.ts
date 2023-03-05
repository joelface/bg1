import {
  booking,
  bookings,
  client,
  donald,
  hm,
  lttRes,
  mickey,
  minnie,
  mk,
  pluto,
  sm,
  tracker,
} from '@/__fixtures__/genie';
import { fetchJson } from '@/fetch';
import { TODAY, TOMORROW, setTime, waitFor } from '@/testing';

import wdw from '../data/wdw';
import {
  Booking,
  BookingTracker,
  ExpData,
  GenieClient,
  Guest,
  LightningLane,
  ModifyNotAllowed,
  PlusExperience,
  RequestError,
  isGenieOrigin,
} from '../genie';

jest.mock('@/fetch');
const fetchJsonMock = fetchJson as jest.MockedFunction<typeof fetchJson>;

const accessToken = 'access_token_123';
const swid = '{abc}';
const origin = 'https://disneyworld.disney.go.com';
hm.priority = undefined;

function response(data: any, status = 200) {
  return { status, data: { ...data } };
}

function respond(...responses: ReturnType<typeof response>[]) {
  for (const res of responses) fetchJsonMock.mockResolvedValueOnce(res);
}

function expectFetch(
  path: string,
  { method, params, data }: Parameters<typeof fetchJson>[1] = {},
  appendUserId = true,
  nthCall = 1
) {
  params ||= {};
  if (appendUserId) params = { ...params, userId: swid };
  expect(fetchJsonMock).nthCalledWith(
    nthCall,
    expect.stringContaining(origin + path),
    {
      method: method || 'GET',
      params,
      data,
      headers: {
        Authorization: `BEARER ${accessToken}`,
        'x-user-id': '{abc}',
      },
    }
  );
}

function splitName({ name, ...rest }: Guest) {
  const [firstName, lastName = ''] = name.split(' ');
  return { ...rest, firstName, lastName };
}

describe('isGenieOrigin()', () => {
  it('returns true when Genie origin', () => {
    expect(isGenieOrigin('https://disneyworld.disney.go.com')).toBe(true);
    expect(isGenieOrigin('https://disneyland.disney.go.com')).toBe(true);
  });
  it('returns false when not Genie origin', () => {
    expect(isGenieOrigin('https://example.com')).toBe(false);
  });
});

describe('GenieClient', () => {
  const authStore = {
    getData: () => ({ accessToken, swid }),
    setData: () => null,
    deleteData: jest.fn(),
  };
  const data = {
    ...wdw,
    experiences: { ...wdw.experiences },
    pdts: { [mk.id]: [690 /* 11:30 */, 870 /* 14:30 */, 1050 /* 17:30 */] },
  };
  const smData = data.experiences[sm.id] as ExpData;
  smData.priority = sm.priority;
  smData.pdtMask = 0b011;
  const client = new GenieClient({
    origin: 'https://disneyworld.disney.go.com',
    authStore,
    data,
    tracker,
  });
  const onUnauthorized = jest.fn();
  client.onUnauthorized = onUnauthorized;
  const guests = [mickey, minnie, pluto];
  const ineligibleGuests = [donald];
  const guestsRes = response({
    guests: guests.map(splitName),
    ineligibleGuests: ineligibleGuests.map(splitName),
    primaryGuestId: mickey.id,
  });

  beforeEach(() => {
    fetchJsonMock.mockReset();
    authStore.deleteData.mockReset();
    onUnauthorized.mockReset();
    setTime('10:00');
  });

  describe('load()', () => {
    it('loads Genie client', async () => {
      const client = await GenieClient.load({
        origin: 'https://disneyland.disney.go.com',
        authStore,
      });
      expect(client.parks.map(p => p.name)).toEqual([
        'Disneyland',
        'California Adventure',
      ]);
    });
  });

  describe('resort', () => {
    it('returns resort abbreviation', () => {
      expect(client.resort).toBe('WDW');
    });
  });

  describe('experiences()', () => {
    it('returns experience info', async () => {
      const nextBookTime = '11:00:00';
      const res = response({
        availableExperiences: [sm, { id: 'not_a_real_id' }],
        eligibility: {
          flexEligibilityWindows: [
            { time: { time: '13:30:00' } },
            { time: { time: nextBookTime } },
          ],
        },
      });
      const smExp: PlusExperience = {
        ...smData,
        ...sm,
        drop: true,
        experienced: false,
      };
      const getExpData = async () => client.experiences(mk);
      respond(guestsRes, ...Array(4).fill(res));
      expect(await getExpData()).toEqual([smExp]);
      expect(client.nextBookTime).toBe('11:00:00');
      expectFetch('/ea-vas/api/v1/guests', {
        params: { productType: 'FLEX', experienceId: '0', parkId: '0' },
      });
      expectFetch(
        `/tipboard-vas/api/v1/parks/${encodeURIComponent(mk.id)}/experiences`,
        { params: { eligibilityGuestIds: guests.map(g => g.id).join(',') } },
        true,
        2
      );

      setTime('13:00');
      expect(await getExpData()).toEqual([smExp]);

      setTime('15:00');
      expect(await getExpData()).toEqual([{ ...smExp, drop: false }]);
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
    const guestsUrl = '/ea-vas/api/v1/guests';

    it('returns eligible guests for experience', async () => {
      respond(guestsRes);
      expect(await client.guests(hm)).toEqual({
        eligible: [mickey, minnie, pluto],
        ineligible: ineligibleGuests,
      });
      expectFetch(guestsUrl, {
        params: {
          productType: 'FLEX',
          experienceId: hm.id,
          parkId: mk.id,
        },
      });
    });

    it('includes avatarImageUrls when characterId exists', async () => {
      respond(
        response({
          guests: [
            { ...splitName(mickey), characterId: 19633995 },
            { ...splitName(minnie), characterId: 18405224 },
            { ...splitName(pluto), characterId: 90004625 },
          ],
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
          guests: [donald].map(splitName),
          ineligibleGuests: [],
          primaryGuestId: mickey.id,
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
        firstName: 'Fifi',
        lastName: '',
        ineligibleReason: 'TOO_EARLY',
        eligibleAfter: '10:30:00',
      };
      const goofy = {
        id: 'goofy',
        firstName: 'Goofy',
        lastName: '',
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
          ],
          primaryGuestId: mickey.id,
        })
      );
      const { ineligible } = await client.guests(hm);
      expect(ineligible.map(g => g.id)).toEqual(
        [pluto, mickey, fifi, minnie, goofy, donald].map(g => g.id)
      );
    });
  });

  describe('offer()', () => {
    const offer = {
      id: 'offer1',
      date: TODAY,
      startTime: '14:30:00',
      endTime: '15:30:00',
      status: 'ACTIVE',
      changeStatus: 'NONE',
    };
    const offerGuests = [mickey, minnie].map(splitName);

    it('obtains Lightning Lane offer', async () => {
      respond(
        response(
          {
            offer,
            eligibleGuests: offerGuests,
            ineligibleGuests: [],
          },
          201
        )
      );
      expect(await client.offer(hm, guests)).toEqual({
        id: offer.id,
        start: { date: offer.date, time: offer.startTime },
        end: { date: offer.date, time: offer.endTime },
        active: true,
        changed: false,
        guests: {
          eligible: [mickey, minnie],
          ineligible: [],
        },
        experience: hm,
      });
      expectFetch(
        '/ea-vas/api/v2/products/flex/offers',
        {
          method: 'POST',
          data: {
            guestIds: guests.map(g => g.id),
            ineligibleGuests: [],
            primaryGuestId: mickey.id,
            parkId: mk.id,
            experienceId: hm.id,
            selectedTime: hm.flex.nextAvailableTime,
          },
        },
        false
      );
    });

    it('reports changes/failure', async () => {
      respond(
        response(
          {
            offer: { ...offer, status: 'DELETED', changeStatus: 'CHANGED' },
            eligibleGuests: [],
            ineligibleGuests: offerGuests.map(g => ({
              ...g,
              ineligibleReason: 'TOO_EARLY_FOR_PARK_HOPPING',
            })),
          },
          201
        )
      );
      expect(await client.offer(hm, guests)).toEqual({
        id: offer.id,
        start: { date: offer.date, time: offer.startTime },
        end: { date: offer.date, time: offer.endTime },
        active: false,
        changed: true,
        guests: {
          eligible: [],
          ineligible: [mickey, minnie].map(g => ({
            ...g,
            ineligibleReason: 'TOO_EARLY_FOR_PARK_HOPPING',
          })),
        },
        experience: hm,
      });
    });

    it('throws ModifyNotAllowed when not allowed to modify', async () => {
      await expect(
        client.offer(hm, guests, { ...booking, modifiable: false })
      ).rejects.toThrow(ModifyNotAllowed);

      setTime(booking.end.time as string, 1);
      await expect(client.offer(hm, guests, booking)).rejects.toThrow(
        ModifyNotAllowed
      );
    });
  });

  describe('cancelOffer()', () => {
    it('cancels offer', async () => {
      respond(response({}, 204));
      const offer = { id: 'offer1' };
      await client.cancelOffer(offer);
      expectFetch(
        '/ea-vas/api/v1/offers/' + offer.id,
        {
          method: 'DELETE',
          params: { productType: 'FLEX' },
        },
        false
      );
    });
  });

  describe('bookings()', () => {
    const entId = ({ id }: { id: string }, type = 'Attraction') =>
      `${id};entityType=${type}`;
    const xid = (guest: { id: string }) => guest.id + ';type=xid';

    function createBookingsResponse(bookings: Booking[]) {
      const subtypeToKind = {
        'G+': 'FLEX',
        ILL: 'STANDARD',
        DAS: 'DAS',
        MULTI: 'OTHER',
        OTHER: 'OTHER',
      };
      return response({
        items: [
          {
            // This item should be ignored
            type: 'FASTPASS',
            kind: 'PARK_PASS',
          },
          {
            // This item should be ignored
            type: 'ACTIVITY',
            asset: '19432184;entityType=activity-product',
          },
          {
            // This item should be ignored
            type: 'FASTPASS',
            kind: 'FDS',
            facility: entId(hm),
            cancellable: true,
            multipleExperiences: false,
            displayStartDate: TOMORROW,
            displayStartTime: '10:00:00',
            displayEndDate: TOMORROW,
            displayEndTime: '11:00:00',
            guests: [{ id: xid(mickey), entitlementId: 'hm1000_01' }],
          },
          ...bookings.map(b => ({
            ...(b.type === 'LL'
              ? {
                  type: 'FASTPASS',
                  kind: subtypeToKind[b.subtype],
                  facility: entId(b.choices ? hm : b),
                  displayStartDate: b.start.date,
                  displayStartTime: b.start.time,
                  displayEndDate: b.end.date,
                  displayEndTime: b.end.time,
                  guests: b.guests.map(g => ({
                    id: xid(g),
                    entitlementId: g.entitlementId,
                    bookingId: g.bookingId,
                    redemptionsRemaining: g.redemptions,
                  })),
                }
              : {
                  type: 'DINING',
                  id: b.bookingId,
                  guests: b.guests.map(g => ({ id: xid(g) })),
                  asset: '90006947;entityType=table-service',
                  startDateTime: `${b.start.date}T${b.start.time}-0400`,
                }),
            cancellable: b.cancellable,
            modifiable: b.modifiable,
            multipleExperiences: !!b.choices,
            assets: b.choices
              ? [
                  {
                    content: entId(b),
                    excluded: false,
                    original: true,
                  },
                  ...b.choices.map(exp => ({
                    content: entId(exp),
                    excluded: false,
                    original: false,
                  })),
                  { content: 'excluded-id', excluded: true, original: false },
                ]
              : undefined,
          })),
        ],
        assets: {
          '90006947;entityType=table-service': {
            name: 'Liberty Tree Tavern Lunch',
            facility: '90001819;entityType=restaurant',
          },
          '90001819;entityType=restaurant': {
            location: entId(mk, 'theme-park'),
          },
          '19432184;entityType=activity-product': {
            facility: '19536899;entityType=tour',
          },
          '19536899;entityType=tour': {},
          ...Object.fromEntries(
            [booking, ...bookings, ...bookings.map(b => b.choices || [])]
              .flat()
              .map(b => [
                entId(b),
                {
                  id: entId(b),
                  name: b.name,
                  location: entId(b.park, 'theme-park'),
                },
              ])
          ),
          ...Object.fromEntries(
            guests.map(g => [
              g.id,
              {
                media: {
                  small: {
                    url: `https://example.com/${g.id}.jpg`,
                  },
                },
              },
            ])
          ),
        },
        profiles: Object.fromEntries(
          guests.map(g => {
            const [firstName, lastName = ''] = g.name.split(' ');
            return [
              xid(g),
              {
                id: xid(g),
                name: { firstName, lastName },
                avatarId: g.id,
              },
            ];
          })
        ),
      });
    }
    const bookingsRes = createBookingsResponse(bookings);

    it('returns current bookings', async () => {
      setTime(lttRes.start.time, 30);
      respond(bookingsRes);
      expect(await client.bookings()).toEqual(bookings);
    });

    it('excludes non-LL reservations >30 minutes old', async () => {
      setTime(lttRes.start.time, 31);
      respond(bookingsRes);
      expect(await client.bookings()).toEqual(
        bookings.filter(b => b !== lttRes)
      );
    });

    it('overrides API-supplied modifiable property if end of return window', async () => {
      setTime(booking.end.time as string, 1);
      respond(bookingsRes);
      const b = (await client.bookings()).filter(b => b.id === booking.id)[0];
      expect(b.modifiable).toBe(false);
    });

    it('includes park data', async () => {
      const bs: LightningLane = {
        type: 'LL',
        subtype: 'G+',
        id: '16491297',
        name: 'The Barnstormer',
        park: mk,
        start: { date: undefined, time: undefined },
        end: { date: undefined, time: undefined },
        cancellable: false,
        modifiable: false,
        guests: [{ ...mickey, entitlementId: 'bs_01', bookingId: 'bs_bid_01' }],
        bookingId: 'bs_01',
      };
      const bookings = [bs];
      respond(createBookingsResponse(bookings));
      expect(await client.bookings()).toEqual([{ ...bs, name: 'Barnstormer' }]);
    });

    it(`skips itinerary items that can't be parsed`, async () => {
      const bookingsRes = createBookingsResponse([booking]);
      bookingsRes.data.items.unshift({
        type: 'FASTPASS',
        kind: 'FLEX',
      });
      respond(bookingsRes);
      const spy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => null);
      expect(await client.bookings()).toEqual([booking]);
      expect(spy).toBeCalled();
      spy.mockRestore();
    });
  });

  describe('book()', () => {
    const guests = [mickey, minnie];
    const offer = {
      id: 'offer1',
      start: { date: TODAY, time: '18:00:00' },
      end: { date: TODAY, time: '19:00:00' },
      changeStatus: 'NONE',
      guests: { eligible: guests, ineligible: [] },
      experience: hm,
    };

    it('books Lightning Lanes', async () => {
      const entitlement = (guest: { id: string }) => ({
        id: 'ent-' + guest.id,
        guestId: guest.id,
        usageDetails: {
          status: 'BOOKED',
          redeemable: true,
          modifiable: true,
        },
      });
      const newBooking = {
        id: 'NEW_BOOKING',
        entitlements: guests.map(g => entitlement(g)),
        startDateTime: `${offer.start.date}T${offer.start.time}`,
        endDateTime: `${offer.end.date}T${offer.end.time}`,
        assignmentDetails: {
          product: 'INDIVIDUAL',
          reason: 'OTHER',
        },
        singleExperienceDetails: {
          experienceId: hm.id,
          parkId: mk.id,
        },
      };
      respond(response({ booking: newBooking }, 201), guestsRes);
      expect(await client.book(offer)).toEqual({
        type: 'LL',
        subtype: 'G+',
        id: hm.id,
        name: hm.name,
        park: mk,
        start: offer.start,
        end: offer.end,
        cancellable: true,
        modifiable: true,
        guests: guests.map((g, i) => ({
          ...g,
          entitlementId: newBooking.entitlements[i].id,
        })),
        bookingId: 'ent-' + mickey.id,
      });
      expectFetch(
        '/ea-vas/api/v1/products/flex/bookings',
        {
          method: 'POST',
          data: { offerId: offer.id },
        },
        false
      );
    });

    it('throws RequestError on failure', async () => {
      respond(response({}, 410));
      await expect(client.book(offer)).rejects.toThrow(RequestError);
    });

    it('throws ModifyNotAllowed when not allowed to modify', async () => {
      await expect(
        client.book(offer, { ...booking, modifiable: false })
      ).rejects.toThrow(ModifyNotAllowed);

      setTime(booking.end.time as string, 1);
      await expect(client.book(offer, booking)).rejects.toThrow(
        ModifyNotAllowed
      );
    });
  });

  describe('cancelBooking()', () => {
    it('cancel booking', async () => {
      respond(response({}));
      await client.cancelBooking(booking.guests);
      expectFetch(
        `/ea-vas/api/v1/entitlements/${booking.guests
          .map(g => g.entitlementId)
          .join(',')}`,
        { method: 'DELETE' },
        false
      );
    });
  });

  describe('nextDropTime()', () => {
    it('returns next drop time', () => {
      setTime('11:30:59');
      expect(client.nextDropTime(mk)).toBe('11:30');
      setTime('11:31:00');
      expect(client.nextDropTime(mk)).toBe('14:30');
      setTime('14:31:00');
      expect(client.nextDropTime(mk)).toBe('17:30');
      setTime('17:31:00');
      expect(client.nextDropTime(mk)).toBe(undefined);
    });
  });

  describe('logOut()', () => {
    it('calls onUnauthorized() and authStore.deleteData()', () => {
      client.logOut();
      expect(onUnauthorized).toBeCalledTimes(1);
      expect(authStore.deleteData).toBeCalledTimes(1);
    });

    it('is called on 401 Unauthorized response', async () => {
      respond({ status: 401, data: {} });
      await expect(client.experiences(mk)).rejects.toThrow(RequestError);
      await waitFor(() => expect(onUnauthorized).toBeCalledTimes(1));
    });
  });
});

describe('BookingTracker', () => {
  localStorage.clear();
  const tracker = new BookingTracker();

  describe('update()', () => {
    it('updates tracking data', async () => {
      await tracker.update([bookings[3]], client);
      await tracker.update(bookings, client);
      expect(tracker.experienced(booking)).toBe(false);
      expect(tracker.experienced(bookings[3])).toBe(true);

      client.guests.mockResolvedValueOnce({
        eligible: [],
        ineligible: [
          { ...mickey, ineligibleReason: 'EXPERIENCE_LIMIT_REACHED' },
        ],
      });
      await tracker.update([bookings[3]], client);
      expect(tracker.experienced(booking)).toBe(true);
      expect(tracker.experienced(bookings[3])).toBe(true);
    });
  });
});
