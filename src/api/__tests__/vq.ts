import { expectFetch, respond, response } from '@/__fixtures__/client';
import { wdw } from '@/__fixtures__/vq';
import { guests, mtwr, queues, rotr, santa } from '@/__fixtures__/vq';

import { RequestError } from '../client';
import { Guest, VQClient, sortGuests } from '../vq';

expectFetch.baseUrl =
  'https://vqguest-svc-wdw.wdprapps.disney.com/application/v1/guest/';

describe('VQClient', () => {
  const client = new VQClient(wdw);

  beforeEach(() => {
    jest.clearAllMocks();
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
    responseStatus: 'OK',
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
        data: {
          queueId: rotr.id,
          requestType: 'REVIEW',
        },
      });
    });
  });

  const jqSuccessRes = (guests: Guest[]) =>
    response({
      responseStatus: 'OK',
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
    response({
      responseStatus: 'INVALID_GUEST',
      conflicts: [
        {
          conflictType: 'NO_PARK_PASS',
          guestIds: guests.map(g => g.id),
        },
      ],
    });
  const jqClosedRes = response({
    responseStatus: 'CLOSED_QUEUE',
    conflicts: [],
  });

  describe('joinQueue()', () => {
    afterEach(() => {
      expectFetch('joinQueue', {
        data: {
          queueId: rotr.id,
          guestIds: guests.map(g => g.id),
        },
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
      respond(response({ responseStatus: 'OK' }, 500));
      await expect(client.joinQueue(rotr, guests)).rejects.toThrow(
        RequestError
      );
    });

    it('throws RequestError on unrecognized responseStatus', async () => {
      respond(response({ responseStatus: 'UH_OH' }));
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
