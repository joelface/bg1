import { wdw } from '@/__fixtures__/vq';
import { guests, mtwr, queues, rotr, santa } from '@/__fixtures__/vq';
import { fetchJson } from '@/fetch';

import { RequestError } from '../client';
import { Guest, VQClient, sortGuests } from '../vq';

jest.mock('@/fetch');

function response(
  data: { [key: string]: unknown },
  responseStatus = 'OK',
  status = 200
) {
  return { ok: status === 200, status, data: { ...data, responseStatus } };
}

function respond(...responses: ReturnType<typeof response>[]) {
  for (const res of responses) {
    jest.mocked(fetchJson).mockResolvedValueOnce(res);
  }
}

function expectFetch(resource: string, data?: unknown) {
  const fetchArgs: unknown[] = [
    `https://vqguest-svc-wdw.wdprapps.disney.com/application/v1/guest/${resource}`,
    {
      method: data ? 'POST' : 'GET',
      data,
      headers: expect.objectContaining({
        Authorization: 'BEARER access_token_123',
      }),
    },
  ];
  expect(jest.mocked(fetchJson).mock.calls[0]).toEqual(fetchArgs);
}

describe('VQClient', () => {
  const authStore = {
    getData: () => ({ swid: '', accessToken: 'access_token_123' }),
    setData: () => null,
    deleteData: jest.fn(),
    onUnauthorized: () => null,
  };
  const client = new VQClient(wdw, authStore);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const queueClosedRes = response({
    queues: queues.map(({ id, ...q }) => ({ ...q, queueId: id })),
  });

  describe('getQueues()', () => {
    it('returns queues', async () => {
      respond(queueClosedRes);
      expect(await client.getQueues()).toEqual([santa, mtwr, rotr]);
      expectFetch('getQueues');
    });
  });

  describe('getQueue()', () => {
    beforeEach(() => {
      respond(queueClosedRes);
    });

    afterEach(() => {
      expectFetch('getQueues');
    });

    it('returns queue', async () => {
      expect(await client.getQueue({ id: rotr.id })).toEqual(rotr);
    });

    it('throws Error when queue not found', async () => {
      await expect(client.getQueue({ id: 'not_a_real_id' })).rejects.toThrow();
    });
  });

  const guestsRes = response({
    guests: guests
      .map(({ id, name, primary, preselected, ...rest }) => {
        const [firstName, lastName = ''] = name.split(' ');
        return {
          guestId: id,
          firstName,
          lastName,
          isPrimaryGuest: primary,
          isPreselected: preselected,
          ...rest,
        };
      })
      .reverse(),
  });

  describe('getLinkedGuests()', () => {
    it('returns guests', async () => {
      respond(guestsRes);
      expect(await client.getLinkedGuests(rotr)).toEqual(guests);
      expectFetch('getLinkedGuests', {
        queueId: rotr.id,
        requestType: 'REVIEW',
      });
    });
  });

  const jqSuccessRes = (guests: Guest[]) =>
    response({
      positions: [
        {
          queueId: rotr.id,
          guestIds: ['friend_in_separate_bg'],
          boardingGroup: 1,
        },
        {
          queueId: rotr.id,
          guestIds: guests.map(g => g.id),
          boardingGroup: 77,
        },
      ],
    });
  const jqInvalidRes = (guests: Guest[]) =>
    response(
      {
        conflicts: [
          {
            conflictType: 'NO_PARK_PASS',
            guestIds: guests.map(g => g.id),
          },
        ],
      },
      'INVALID_GUEST'
    );
  const jqClosedRes = response({ conflicts: [] }, 'CLOSED_QUEUE');

  describe('joinQueue()', () => {
    afterEach(() => {
      expectFetch('joinQueue', {
        queueId: rotr.id,
        guestIds: guests.map(g => g.id),
      });
    });

    it('returns success result', async () => {
      respond(jqSuccessRes(guests));
      expect(await client.joinQueue(rotr, guests)).toEqual({
        boardingGroup: 77,
        closed: false,
        conflicts: {},
      });
    });

    it('returns partial success result', async () => {
      respond(jqInvalidRes([guests[0]]), jqSuccessRes(guests.slice(1)));
      expect(await client.joinQueue(rotr, guests)).toEqual({
        boardingGroup: 77,
        closed: false,
        conflicts: { [guests[0].id]: 'NO_PARK_PASS' },
      });
    });

    it('returns closed queue failure result', async () => {
      respond(jqClosedRes);
      expect(await client.joinQueue(rotr, guests)).toEqual({
        boardingGroup: null,
        closed: true,
        conflicts: {},
      });
    });

    it('throws RequestError if boarding group not found', async () => {
      respond(response({ positions: [] }));
      await expect(client.joinQueue(rotr, guests)).rejects.toThrow(
        RequestError
      );
    });

    it('throws RequestError on 5xx status code', async () => {
      respond(response({}, 'OK', 500));
      await expect(client.joinQueue(rotr, guests)).rejects.toThrow(
        RequestError
      );
    });

    it('throws RequestError on unrecognized responseStatus', async () => {
      respond(response({}, 'UH_OH'));
      await expect(client.joinQueue(rotr, guests)).rejects.toThrow(
        RequestError
      );
    });
  });
});

describe('sortGuests()', () => {
  it('sorts in place', () => {
    let g = guests;
    g = [g[3], g[1], g[0], g[2]];
    const sorted = sortGuests(g);
    expect(sorted).toEqual(guests);
    expect(sorted).toBe(g);
  });
});
