import { JsonResponse } from '@/fetch';

import { ApiClient, RequestError } from './client';
import { Park } from './data';

interface BaseQueue {
  name: string;
  isAcceptingJoins: boolean;
  isAcceptingPartyCreation: boolean;
  nextScheduledOpenTime: string | null;
  nextScheduledPartyCreationOpenTime: string | null;
  maxPartySize: number;
  howToEnterMessage: string;
  categoryContentId?: 'attraction' | 'character' | 'special-event';
}

export interface Queue extends BaseQueue {
  id: string;
  park?: Park;
}

export interface ApiQueue extends BaseQueue {
  queueId: string;
  tabContentId?: string;
}

interface GetQueuesRequest {
  resource: 'getQueues';
}

interface GetQueuesResponse {
  queues: ApiQueue[];
}

interface BaseGuest {
  avatarImageUrl?: string;
}

export interface Guest extends BaseGuest {
  id: string;
  name: string;
  primary: boolean;
  preselected: boolean;
}

interface ApiGuest extends BaseGuest {
  guestId: string;
  firstName: string;
  lastName: string;
  isPrimaryGuest?: boolean;
  isPreselected?: boolean;
}

export interface Position {
  queueId: string;
  guestIds: string[];
  boardingGroup: number;
  queuedAt: number;
}

interface JoinQueueRequest {
  resource: 'joinQueue';
  data: {
    queueId: string;
    guestIds: string[];
  };
}

interface JoinQueueOKResponse {
  responseStatus: 'OK';
  queues: Queue[];
  guests: ApiGuest[];
  positions: Position[];
}

type JoinQueueConflictType =
  | 'NO_PARK_PASS'
  | 'NOT_IN_PARK'
  | 'REDEEM_LIMIT_REACHED';

interface JoinQueueConflictsResponse {
  responseStatus: 'INVALID_GUEST' | 'CLOSED_QUEUE';
  conflicts: {
    conflictType: JoinQueueConflictType;
    guestIds: string[];
  }[];
}

type JoinQueueResponse = JoinQueueOKResponse | JoinQueueConflictsResponse;

export type JoinQueueConflicts = { [guestId: string]: JoinQueueConflictType };

export interface JoinQueueResult {
  boardingGroup: number | null;
  conflicts: JoinQueueConflicts;
  closed: boolean;
}

interface GetLinkedGuestsRequest {
  resource: 'getLinkedGuests';
  data: {
    queueId: string;
    requestType: 'REVIEW' | 'CHANGE';
  };
}

interface GetLinkedGuestsOKResponse {
  responseStatus: 'OK';
  guests: ApiGuest[];
}

type VQRequest = GetQueuesRequest | JoinQueueRequest | GetLinkedGuestsRequest;
type VQResource = VQRequest['resource'] | 'getQueues';

export const sortGuests = (guests: Guest[]): Guest[] =>
  guests.sort(
    (a, b) =>
      +b.primary - +a.primary ||
      +b.preselected - +a.preselected ||
      a.name.localeCompare(b.name)
  );

const path = (resource: VQResource) => `/application/v1/guest/${resource}`;

export class VQClient extends ApiClient {
  protected static origins = {
    WDW: 'https://vqguest-svc-wdw.wdprapps.disney.com',
    DLR: 'https://vqguest-svc.wdprapps.disney.com',
  };

  async getQueues(): Promise<Queue[]> {
    const response = await this.post<GetQueuesResponse>({
      resource: 'getQueues',
    });
    if (!Array.isArray(response.data?.queues)) throw new RequestError(response);
    return response.data.queues
      .filter(q => !!q.categoryContentId)
      .map(({ queueId, tabContentId = '', ...queue }) => ({
        ...queue,
        id: queueId,
        park: this.data.parks.get(tabContentId.split(';')[0]),
      }));
  }

  async getQueue(queue: Pick<Queue, 'id'>): Promise<Queue> {
    const q = (await this.getQueues()).find(q => q.id === queue.id);
    if (q) return q;
    throw new Error('Queue not Found');
  }

  async getLinkedGuests(queue: Pick<Queue, 'id'>): Promise<Guest[]> {
    const { data } = await this.post<GetLinkedGuestsOKResponse>({
      resource: 'getLinkedGuests',
      data: { queueId: queue.id, requestType: 'REVIEW' },
    });
    return sortGuests(
      data.guests.map(
        ({
          guestId,
          firstName = '',
          lastName = '',
          isPrimaryGuest,
          isPreselected,
          ...rest
        }) => ({
          ...rest,
          id: guestId,
          name: `${firstName} ${lastName}`.trim(),
          primary: !!isPrimaryGuest,
          preselected: !!isPreselected,
        })
      )
    );
  }

  async joinQueue(
    queue: Pick<Queue, 'id'>,
    guests: Pick<Guest, 'id'>[]
  ): Promise<JoinQueueResult> {
    const guestIds = guests.map(g => g.id);
    const response = await this.post<JoinQueueResponse>({
      resource: 'joinQueue',
      data: { queueId: queue.id, guestIds },
    });
    const { data } = response;
    if (data.responseStatus === 'OK') {
      const pos = data.positions.find(
        p =>
          p.queueId === queue.id &&
          p.guestIds.length > 0 &&
          guestIds.some(gid => p.guestIds.includes(gid))
      );
      if (!pos) throw new RequestError(response);
      return {
        boardingGroup: pos.boardingGroup,
        conflicts: {},
        closed: false,
      };
    } else if (
      data.responseStatus === 'INVALID_GUEST' ||
      data.responseStatus === 'CLOSED_QUEUE'
    ) {
      const closed = data.responseStatus === 'CLOSED_QUEUE';
      const invalidIds = new Set<string>();
      const conflicts: JoinQueueResult['conflicts'] = {};
      for (const conflict of data.conflicts) {
        for (const guestId of conflict.guestIds) {
          const guest = guests.find(g => g.id === guestId);
          if (!guest) continue;
          conflicts[guest.id] = conflict.conflictType;
          invalidIds.add(guestId);
        }
      }
      const validGuests = guests.filter(g => !invalidIds.has(g.id));
      if (closed || validGuests.length === 0) {
        return { boardingGroup: null, conflicts, closed };
      }
      const result = await this.joinQueue(queue, validGuests);
      result.conflicts = { ...conflicts, ...result.conflicts };
      return result;
    } else {
      throw new RequestError(response);
    }
  }

  protected async post<T>(
    request: VQRequest
  ): Promise<{ ok: boolean; status: number; data: T }> {
    try {
      return await this.request<T>({
        ...request,
        method: 'data' in request ? 'POST' : 'GET',
        path: path(request.resource),
      });
    } catch (e) {
      if (e instanceof RequestError) {
        const response = e.response as JsonResponse<T>;
        const { ok, status } = response;
        if (!ok && status < 500 && status !== 401) return response;
      }
      throw e;
    }
  }
}
