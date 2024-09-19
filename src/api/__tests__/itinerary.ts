import { respond, response } from '@/__fixtures__/client';
import {
  ak,
  booking,
  bookings,
  hm,
  mickey,
  minnie,
  mk,
  multiExp,
  omitOrderDetails,
  pluto,
  wdw,
} from '@/__fixtures__/genie';
import { TODAY, YESTERDAY, setTime } from '@/testing';

import { Booking, ItineraryClient, LightningLane } from '../itinerary';

const guests = [mickey, minnie, pluto];

describe('ItineraryClient', () => {
  const client = new ItineraryClient(wdw);
  client.onRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setTime('10:00');
  });

  describe('plans()', () => {
    const entId = ({ id }: { id: string }, type = 'Attraction') =>
      `${id};entityType=${type}`;
    const xid = (guest: { id: string }) => guest.id + ';type=xid';

    function bookingsResponse(bookings: Booking[]) {
      const subtypeToKind = {
        MP: 'FLEX',
        SP: 'STANDARD',
        DAS: 'DAS',
        MEP: 'OTHER',
        OTHER: 'OTHER',
      };
      return response({
        loggedInGuestId: xid(mickey),
        items: [
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
                      entitlementId: g.entitlementId,
                      bookingId: g.bookingId,
                      redemptionsRemaining: g.redemptions,
                      redemptionsAllowed: g.redemptions,
                    })),
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
                      displayStartDate: b.start.date,
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

    it('returns bookings', async () => {
      respond(bookingsResponse(bookings));
      expect(await client.plans()).toEqual(bookings);
    });

    it('includes park data', async () => {
      const bs: LightningLane = {
        type: 'LL',
        subtype: 'MP',
        id: '16491297',
        name: 'The Barnstormer',
        park: mk,
        start: { date: TODAY, time: undefined },
        end: { date: undefined, time: undefined },
        cancellable: false,
        modifiable: false,
        guests: [
          {
            ...omitOrderDetails(mickey),
            entitlementId: 'bs_01',
            bookingId: 'bs_bid_01',
            redemptions: 1,
          },
        ],
        bookingId: 'bs_01',
      };
      const bookings = [bs];
      respond(bookingsResponse(bookings));
      const b = await client.plans();
      expect(b).toEqual([{ ...bs, name: 'Barnstormer' }]);
    });

    it(`skips itinerary items that can't be parsed`, async () => {
      const bookingsRes = bookingsResponse([booking]);
      bookingsRes.data.items.unshift({
        type: 'FASTPASS',
        kind: 'FLEX',
      });
      respond(bookingsRes);
      const error = jest.spyOn(console, 'error');
      error.mockImplementation(() => {});
      expect(await client.plans()).toEqual([booking]);
      expect(error).toHaveBeenCalled();
      error.mockRestore();
    });

    it('shows MEP carried over from previous day as starting today', async () => {
      const bookingsRes = bookingsResponse([
        { ...multiExp, start: { date: YESTERDAY, time: '23:00:00' } },
      ]);
      respond(bookingsRes);
      expect(await client.plans()).toEqual([
        { ...multiExp, start: { date: TODAY } },
      ]);
    });
  });
});
