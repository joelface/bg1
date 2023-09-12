import {
  booking,
  bookings,
  client,
  donald,
  expiredLL,
  hm,
  mickey,
  minnie,
  pluto,
  sm,
  tracker,
} from '@/__fixtures__/genie';
import { fetchJson } from '@/fetch';
import { TODAY, setTime } from '@/testing';

import { RequestError } from '../client';
import { Experience as ExpData } from '../data';
import { experiences, parks } from '../data/wdw';
import {
  Booking,
  BookingTracker,
  FALLBACK_IDS,
  GenieClient,
  Guest,
  LightningLane,
  ModifyNotAllowed,
  PlusExperience,
} from '../genie';

jest.mock('@/fetch');
const diu = {
  disneyInternalUse01: '1',
  disneyInternalUse02: '2',
  disneyInternalUse03: '3',
};
jest.mock('../diu', () => ({ __esModule: true, default: () => diu }));

const accessToken = 'access_token_123';
const swid = '{abc}';
const origin = 'https://disneyworld.disney.go.com';
hm.priority = undefined;

function response(data: any, status = 200) {
  return { ok: status >= 200 && status < 300, status, data: { ...data } };
}

function respond(...responses: ReturnType<typeof response>[]) {
  for (const res of responses) {
    jest.mocked(fetchJson).mockResolvedValueOnce(res);
  }
}

function expectFetch(
  path: string,
  { method, params, data }: Parameters<typeof fetchJson>[1] = {},
  appendUserId = true,
  nthCall = 1
) {
  if (appendUserId) params = { ...params, userId: swid };
  expect(fetchJson).nthCalledWith(
    nthCall,
    expect.stringContaining(origin + path),
    {
      method,
      params,
      data,
      headers: {
        'Accept-Language': 'en-US',
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

describe('GenieClient', () => {
  const authStore = {
    getData: () => ({ accessToken, swid }),
    setData: () => null,
    deleteData: jest.fn(),
    onUnauthorized: () => null,
  };
  const [mk, , , ak] = [...parks.values()];
  const mkDrops = [
    { time: '11:30', experiences: [sm] },
    { time: '14:30', experiences: [sm, hm] },
    { time: '17:30', experiences: [hm] },
  ];
  const data = {
    resort: 'WDW' as const,
    parks,
    experiences,
    drops: { [mk.id]: mkDrops },
  };
  const smData = data.experiences[sm.id] as ExpData;
  smData.priority = sm.priority;
  const client = new GenieClient(data, authStore, tracker);
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
    jest.resetAllMocks();
    setTime('10:00');
  });

  describe('experiences()', () => {
    it('returns experience info', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => null);
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
        ...sm,
        drop: true,
        experienced: false,
      };
      const getExpData = () => client.experiences(mk);
      respond(guestsRes, ...Array(4).fill(res));
      expect(await getExpData()).toEqual([smExp]);
      expect(client.nextBookTime).toBe('11:00:00');
      const ids = FALLBACK_IDS.WDW;
      expectFetch('/ea-vas/api/v1/guests', {
        params: {
          productType: 'FLEX',
          experienceId: ids.experience,
          parkId: ids.park,
        },
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

      expect(console.warn).toBeCalledTimes(3);
      expect(console.warn).lastCalledWith('Missing experience: not_a_real_id');
      jest.mocked(console.warn).mockRestore();
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

  describe('bookings()', () => {
    const entId = ({ id }: { id: string }, type = 'Attraction') =>
      `${id};entityType=${type}`;
    const xid = (guest: { id: string }) => guest.id + ';type=xid';

    function createBookingsResponse(bookings: Booking[]) {
      const subtypeToKind = {
        'G+': 'FLEX',
        ILL: 'STANDARD',
        DAS: 'DAS',
        MEP: 'OTHER',
        OTHER: 'OTHER',
      };
      return response({
        items: [
          {
            // This item should be ignored
            type: 'ACTIVITY',
            asset: '19432184;entityType=activity-product',
          },
          ...bookings.map(b => ({
            id: b.bookingId,
            ...(b.type === 'LL'
              ? {
                  type: 'FASTPASS',
                  kind: subtypeToKind[b.subtype],
                  facility: entId(b.choices ? hm : b),
                  displayStartDate: b.start.date,
                  displayStartTime: b.start.time,
                  displayEndDate: b.end.date,
                  displayEndTime: b.end.time,
                  guests: [
                    ...b.guests.map(g => ({
                      id: xid(g),
                      redemptionsRemaining: 0,
                    })),
                    ...b.guests.map(g => ({
                      id: xid(g),
                      entitlementId: g.entitlementId,
                      bookingId: g.bookingId,
                      redemptionsRemaining:
                        g.redemptions && g.redemptions > 1
                          ? g.redemptions + 1
                          : g.redemptions,
                      redemptionsAllowed: g.redemptions,
                    })),
                    ...b.guests.map(g => ({ id: xid(g) })),
                  ],
                }
              : b.type === 'BG'
              ? {
                  type: 'VIRTUAL_QUEUE_POSITION',
                  status: b.status,
                  boardingGroup: { id: b.boardingGroup },
                  startDateTime: `${b.start.date}T${b.start.time}-0400`,
                  guests: b.guests.map(g => ({ id: xid(g) })),
                  asset:
                    '90e81c93-b84c-48e0-a98d-121094fa842e;type=virtual-queue',
                }
              : b.type === 'APR'
              ? {
                  type: 'FASTPASS',
                  kind: 'PARK_PASS',
                  startDateTime: `${b.start.date}T${b.start.time}-0400`,
                  guests: b.guests.map(g => ({ id: xid(g) })),
                  facility: entId({ id: 'ak_apr' }),
                }
              : {
                  type: 'DINING',
                  guests: b.guests.map(g => ({ id: xid(g) })),
                  asset: '90006947;entityType=table-service',
                  startDateTime: `${b.start.date}T${b.start.time}-0400`,
                }),
            ...(b.type !== 'BG' && {
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
            }),
          })),
        ],
        assets: {
          [entId({ id: 'ak_apr' })]: {
            location: entId(ak, 'theme-park'),
          },
          '90e81c93-b84c-48e0-a98d-121094fa842e;type=virtual-queue': {
            name: 'Tron',
            facility: '411504498;entityType=Attraction',
          },
          '411504498;entityType=Attraction': {
            location: entId(mk, 'theme-park'),
          },
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
        start: { date: TODAY, time: undefined },
        end: { date: undefined, time: undefined },
        cancellable: false,
        modifiable: false,
        guests: [
          {
            ...mickey,
            entitlementId: 'bs_01',
            bookingId: 'bs_bid_01',
            redemptions: 1,
          },
        ],
        bookingId: 'bs_01',
      };
      const bookings = [bs];
      respond(createBookingsResponse(bookings));
      const b = await client.bookings();
      expect(b).toEqual([{ ...bs, name: 'Barnstormer' }]);
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
        modifiable: false,
        guests: guests.map((g, i) => ({
          ...g,
          entitlementId: newBooking.entitlements[i].id,
        })),
        bookingId: 'ent-' + mickey.id,
      });
      expectFetch(
        '/ea-vas/api/v2/products/flex/bookings',
        {
          method: 'POST',
          data: { offerId: offer.id, ...diu },
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
    it('cancels booking', async () => {
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

  describe('upcomingDrops()', () => {
    it('returns upcoming drops', () => {
      expect(client.upcomingDrops(mk)).toStrictEqual(mkDrops);
      setTime('12:00');
      expect(client.upcomingDrops(mk)).toStrictEqual(mkDrops.slice(1));
      setTime('15:00');
      expect(client.upcomingDrops(mk)).toStrictEqual(mkDrops.slice(2));
      setTime('18:00');
      expect(client.upcomingDrops(mk)).toStrictEqual(mkDrops.slice(3));
    });
  });

  describe('nextDropTime()', () => {
    it('returns next drop time', () => {
      expect(client.nextDropTime(mk)).toBe('11:30');
      setTime('12:00');
      expect(client.nextDropTime(mk)).toBe('14:30');
      setTime('15:00');
      expect(client.nextDropTime(mk)).toBe('17:30');
      setTime('18:00');
      expect(client.nextDropTime(mk)).toBe(undefined);
    });
  });
});

describe('BookingTracker', () => {
  localStorage.clear();
  const tracker = new BookingTracker();

  describe('update()', () => {
    it('updates tracking data', async () => {
      await tracker.update([expiredLL], client);
      await tracker.update(bookings, client);
      expect(tracker.experienced(booking)).toBe(false);
      expect(tracker.experienced(expiredLL)).toBe(true);

      client.guests.mockResolvedValueOnce({
        eligible: [],
        ineligible: [
          { ...mickey, ineligibleReason: 'EXPERIENCE_LIMIT_REACHED' },
        ],
      });
      await tracker.update([expiredLL], client);
      expect(tracker.experienced(booking)).toBe(true);
      expect(tracker.experienced(expiredLL)).toBe(true);
    });
  });
});
