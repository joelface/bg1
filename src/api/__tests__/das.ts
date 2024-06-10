import { mickey, minnie, party } from '@/__fixtures__/das';
import { fetchJson } from '@/fetch';
import { TODAY } from '@/testing';

import { DasClient } from '../das';
import * as data from '../data/wdw';
import { Experience, Resort } from '../resort';

jest.mock('@/fetch');

const wdw = new Resort('WDW', data);
const [mk] = wdw.parks;
const accessToken = 'access_token_123';
const swid = '{abc}';
const origin = 'https://disneyworld.disney.go.com';

const hm = wdw.experience('80010208') as Experience;
const sm = wdw.experience('80010190') as Experience;
const jc = wdw.experience('80010153') as Experience;

const booking = {
  type: 'DAS',
  subtype: 'IN_PARK',
  id: jc.id,
  name: jc.name,
  park: mk,
  guests: [
    {
      id: mickey.id,
      name: mickey.name,
      avatarImageUrl: mickey.avatarImageUrl,
      entitlementId: 'jc1030_mickey',
    },
    {
      ...minnie,
      entitlementId: 'jc1030_minnie',
    },
  ],
  start: { date: TODAY, time: '10:30:00' },
  end: {},
  bookingId: 'jc1030',
};

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
  nthCall = 1
) {
  expect(fetchJson).toHaveBeenNthCalledWith(
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

describe('DasClient', () => {
  const authStore = {
    getData: () => ({ accessToken, swid }),
    setData: () => null,
    deleteData: jest.fn(),
    onUnauthorized: () => null,
  };
  const client = new DasClient(wdw, authStore);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('parties()', () => {
    it('returns parties', async () => {
      const res = response({
        bookingGuestId: 'mickey',
        parties: [
          {
            primaryGuest: {
              id: mickey.id,
              name: `${mickey.name} (Me)`,
              characterId: '17532228',
            },
            linkedGuests: [
              {
                id: minnie.id,
                name: minnie.name,
                characterId: '90004486',
              },
            ],
            selectionLimit: 6,
          },
        ],
      });
      respond(res);
      expect(await client.parties()).toEqual([party]);
      expectFetch(`/das-vas/api/v1/users/${encodeURIComponent(swid)}/parties`);
    });
  });

  describe('experiences()', () => {
    it('returns experiences', async () => {
      const res = response({
        experiences: [
          {
            id: jc.id,
            name: 'Jungle',
            type: 'ATTRACTION',
            available: false,
          },
          {
            id: sm.id,
            name: 'Space',
            type: 'ATTRACTION',
            available: true,
            nextAvailableTime: '10:55:00',
          },
          {
            id: hm.id,
            name: 'Haunted',
            type: 'ATTRACTION',
            available: true,
            nextAvailableTime: '10:20:00',
          },
        ],
      });
      respond(res);
      expect(await client.experiences(mk)).toEqual([
        {
          ...hm,
          type: 'ATTRACTION',
          available: true,
          nextAvailableTime: '10:20:00',
        },
        {
          ...sm,
          type: 'ATTRACTION',
          available: true,
          nextAvailableTime: '10:55:00',
        },
      ]);
    });
  });

  describe('book()', () => {
    it('books DAS selection', async () => {
      const eligRes = response({
        eligibility: [
          {
            type: 'ELIGIBLE',
            guestIds: [mickey.id, minnie.id],
          },
        ],
      });
      const availRes = response({
        experience: {
          id: hm.id,
          name: hm.name,
          type: 'ATTRACTION',
          available: true,
          nextAvailableTime: '10:30:00',
        },
      });
      const bookRes = response({
        booking: {
          id: 'jc1030',
          entitlements: [
            {
              id: 'jc1030_mickey',
              guestId: mickey.id,
              usageDetails: {
                status: 'BOOKED',
                redeemable: true,
                modifiable: false,
                validityEndDate: TODAY,
                usesAllowed: 1,
                usesRemaining: 1,
              },
            },
            {
              id: 'jc1030_minnie',
              guestId: minnie.id,
              usageDetails: {
                status: 'BOOKED',
                redeemable: true,
                modifiable: false,
                validityEndDate: TODAY,
                usesAllowed: 1,
                usesRemaining: 1,
              },
            },
          ],
          startDateTime: `${TODAY}T10:30:00`,
          endDateTime: `${TODAY}T02:00:00`,
          assignmentDetails: {
            product: 'DISABILITY_ACCESS_SERVICE',
            reason: 'DISABILITY_ACCESS',
          },
          singleExperienceDetails: {
            experienceId: jc.id,
            parkId: mk.id,
          },
        },
      });
      respond(eligRes, availRes, bookRes);
      expect(
        await client.book({ park: mk, experience: jc, guests: party })
      ).toEqual(booking);
    });
  });

  describe('cancelBooking()', () => {
    it('cancels booking', async () => {
      respond(response({}, 204));
      expect(await client.cancelBooking(booking.guests)).toBe(undefined);
      expectFetch(
        `/das-vas/api/v1/entitlements/${booking.guests
          .map(g => g.entitlementId)
          .join(',')}`,
        { method: 'DELETE' }
      );
    });
  });
});
