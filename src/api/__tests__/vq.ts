import {
  VQClient,
  Guest,
  isVirtualQueueOrigin,
  sortGuests,
  RequestError,
} from '../vq';
import { fetchJson } from '/fetch';
import { waitFor } from '/testing';
import { rotr, mtwr, santa, queues, guests } from '/__fixtures__/vq';

jest.mock('/fetch');
const fetchJsonMock = fetchJson as jest.MockedFunction<typeof fetchJson>;

function response(
  data: { [key: string]: unknown },
  responseStatus = 'OK',
  status = 200
) {
  return { status, data: { ...data, responseStatus } };
}

function respond(...responses: ReturnType<typeof response>[]) {
  for (const res of responses) fetchJsonMock.mockResolvedValueOnce(res);
}

function expectFetch(url: string, data?: unknown) {
  const fetchArgs: unknown[] = [url];
  if (data) {
    fetchArgs.push({
      method: 'POST',
      data,
      headers: {
        Authorization: 'BEARER access_token_123',
      },
    });
  }
  expect(fetchJsonMock.mock.calls[0]).toEqual(fetchArgs);
}

describe('isVirtualQueueOrigin()', () => {
  it('returns true when VQ origin', () => {
    expect(
      isVirtualQueueOrigin('https://vqguest-svc-wdw.wdprapps.disney.com')
    ).toBe(true);
    expect(
      isVirtualQueueOrigin('https://vqguest-svc.wdprapps.disney.com')
    ).toBe(true);
  });
  it('returns false when not VQ origin', () => {
    expect(isVirtualQueueOrigin('https://example.com')).toBe(false);
  });
});

describe('VQClient', () => {
  const authStore = {
    getData: () => ({ swid: '', accessToken: 'access_token_123' }),
    setData: () => null,
    deleteData: jest.fn(),
  };
  const client = new VQClient({
    origin: 'https://vqguest-svc-wdw.wdprapps.disney.com',
    authStore,
  });
  const onUnauthorized = jest.fn();
  client.onUnauthorized = onUnauthorized;
  const getQueuesUrl = client.url('getQueues');
  const joinQueueUrl = client.url('joinQueue');
  const getLinkedGuestsUrl = client.url('getLinkedGuests');

  beforeEach(() => {
    fetchJsonMock.mockReset();
  });

  describe('resort', () => {
    it('returns resort abbreviation', () => {
      expect(client.resort).toBe('WDW');
    });
  });

  describe('url()', () => {
    it('returns joinQueue URL', () => {
      expect(client.url('joinQueue')).toBe(
        'https://vqguest-svc-wdw.wdprapps.disney.com/application/v1/guest/joinQueue'
      );
    });
  });

  const queueClosedRes = response({
    queues: queues.map(({ id, ...q }) => ({ ...q, queueId: id })),
  });

  describe('getQueues()', () => {
    it('returns queues', async () => {
      respond(queueClosedRes);
      expect(await client.getQueues()).toEqual([santa, mtwr, rotr]);
      expectFetch(getQueuesUrl);
    });
  });

  describe('getQueue()', () => {
    beforeEach(() => {
      respond(queueClosedRes);
    });

    afterEach(() => {
      expectFetch(getQueuesUrl);
    });

    it('returns queue', async () => {
      expect(await client.getQueue({ id: rotr.id })).toEqual(rotr);
    });

    it('throws Error when queue not found', async () => {
      await expect(client.getQueue({ id: 'not_a_real_id' })).rejects.toThrow();
    });
  });

  const guestsRes = response({
    guests: guests.map(({ id: guestId, name, ...g }) => {
      const [firstName, lastName = ''] = name.split(' ');
      return { ...g, guestId, firstName, lastName };
    }),
  });

  describe('getLinkedGuests()', () => {
    it('returns guests', async () => {
      respond(guestsRes);
      expect(await client.getLinkedGuests(rotr)).toEqual(guests);
      expectFetch(getLinkedGuestsUrl, { queueId: rotr.id });
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
      expectFetch(joinQueueUrl, {
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

  describe('logOut()', () => {
    it('calls onUnauthorized() and authStore.deleteData()', () => {
      client.logOut();
      expect(onUnauthorized).toBeCalledTimes(1);
      expect(authStore.deleteData).toBeCalledTimes(1);
    });

    it('is called on 401 Unauthorized response', async () => {
      respond(response({}, 'UNAUTHORIZED', 401));
      await expect(client.getLinkedGuests({ id: '1' })).rejects.toThrow(
        RequestError
      );
      await waitFor(() => expect(onUnauthorized).toBeCalledTimes(1));
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
