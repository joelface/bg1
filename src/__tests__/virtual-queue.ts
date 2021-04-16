import { rotr, queues, guests } from '../__fixtures__/vq';
import { vqUrl, ApiClient, QueueNotFound } from '../virtual-queue';

const fetchJson = jest.fn();

function response(data: { [key: string]: unknown }, responseStatus = 'OK') {
  return { status: 200, data: { ...data, responseStatus } };
}

function respond(...responses: ReturnType<typeof response>[]) {
  for (const res of responses) fetchJson.mockResolvedValueOnce(res);
}

function expectFetch(url: string, postData?: unknown) {
  const fetchArgs: unknown[] = [url];
  if (postData) {
    fetchArgs.push({
      method: 'POST',
      body: JSON.stringify(postData),
      headers: {
        Authorization: 'BEARER access_token_123',
        'Content-Type': 'application/json',
      },
    });
  }
  expect(fetchJson.mock.calls[0]).toEqual(fetchArgs);
}

const getQueuesUrl = vqUrl('getQueues');
const joinQueueUrl = vqUrl('joinQueue');
const getLinkedGuestsUrl = vqUrl('getLinkedGuests');

describe('Client', () => {
  const client = new ApiClient(fetchJson, async () => 'access_token_123');

  beforeEach(() => {
    fetchJson.mockReset();
  });

  const queueClosedRes = response({ queues });

  describe('getQueues()', () => {
    it('returns queues', async () => {
      respond(queueClosedRes);
      expect(await client.getQueues()).toEqual(queues);
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
      expect(await client.getQueue({ queueId: rotr.queueId })).toEqual(rotr);
    });

    it('throws QueueNotFound', async () => {
      await expect(
        client.getQueue({ queueId: 'not_a_real_id' })
      ).rejects.toThrow(QueueNotFound);
    });
  });

  const guestsRes = response({ guests });

  describe('getLinkedGuests()', () => {
    it('returns guests', async () => {
      respond(guestsRes);
      expect(await client.getLinkedGuests(rotr)).toEqual(guests);
      expectFetch(getLinkedGuestsUrl, { queueId: rotr.queueId });
    });
  });

  const jqSuccessRes = response({
    positions: [{ queueId: rotr.queueId, boardingGroup: 1 }],
  });
  const jqInvalidRes = response(
    {
      conflicts: [
        {
          conflictType: 'NO_PARK_PASS',
          guestIds: [guests[0].guestId],
        },
      ],
    },
    'INVALID_GUEST'
  );
  const jqClosedRes = response({ conflicts: [] }, 'CLOSED_QUEUE');

  describe('joinQueue()', () => {
    afterEach(() => {
      expectFetch(joinQueueUrl, {
        queueId: rotr.queueId,
        guestIds: guests.map(g => g.guestId),
      });
    });

    it('returns success result', async () => {
      respond(jqSuccessRes);
      expect(await client.joinQueue(rotr, guests)).toEqual({
        boardingGroup: 1,
        closed: false,
        conflicts: [],
      });
    });

    it('returns partial success result', async () => {
      respond(jqInvalidRes, jqSuccessRes);
      expect(await client.joinQueue(rotr, guests)).toEqual({
        boardingGroup: 1,
        closed: false,
        conflicts: [{ guest: guests[0], reason: 'NO_PARK_PASS' }],
      });
    });

    it('returns closed queue failure result', async () => {
      respond(jqClosedRes);
      expect(await client.joinQueue(rotr, guests)).toEqual({
        boardingGroup: null,
        closed: true,
        conflicts: [],
      });
    });
  });
});
