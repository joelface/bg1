import { fetchJson } from '/fetch';
import { AuthStore } from './auth/store';

const ORIGIN_TO_RESORT = {
  'https://vqguest-svc-wdw.wdprapps.disney.com': 'WDW',
  'https://vqguest-svc.wdprapps.disney.com': 'DLR',
} as const;

export type Origin = keyof typeof ORIGIN_TO_RESORT;
export type Resort = typeof ORIGIN_TO_RESORT[Origin];

export function isVirtualQueueOrigin(origin: string): origin is Origin {
  return origin in ORIGIN_TO_RESORT;
}

interface BaseQueue {
  name: string;
  isAcceptingJoins: boolean;
  isAcceptingPartyCreation: boolean;
  nextScheduledOpenTime: string | null;
  maxPartySize: number;
  howToEnterMessage: string;
  categoryContentId: 'attraction' | 'character' | 'special-event';
}

export interface Queue extends BaseQueue {
  id: string;
}

export interface ApiQueue extends BaseQueue {
  queueId: string;
}

type GetQueuesResponse = ApiQueue[];

interface BaseGuest {
  avatarImageUrl?: string;
  isPrimaryGuest?: boolean;
  isPreselected?: boolean;
}

export interface Guest extends BaseGuest {
  id: string;
  name: string;
}

interface ApiGuest extends BaseGuest {
  guestId: string;
  firstName: string;
  lastName: string;
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
  };
}

interface GetLinkedGuestsOKResponse {
  responseStatus: 'OK';
  guests: ApiGuest[];
}

type VQRequest = JoinQueueRequest | GetLinkedGuestsRequest;
type VQResource = VQRequest['resource'] | 'getQueues';

export function sortGuests(guests: Guest[]): Guest[] {
  return guests.sort((a, b) => {
    if (a.isPrimaryGuest !== b.isPrimaryGuest) {
      return Number(b.isPrimaryGuest) - Number(a.isPrimaryGuest);
    }
    if (a.isPreselected !== b.isPreselected) {
      return Number(b.isPreselected) - Number(a.isPreselected);
    }
    return a.name.localeCompare(b.name);
  });
}

export class RequestError extends Error {
  name = 'RequestError';

  constructor(
    public response: Awaited<ReturnType<typeof fetchJson>>,
    message = 'Request failed'
  ) {
    super(`${message}: ${JSON.stringify(response)}`);
  }
}

export class VQClient {
  onUnauthorized = () => undefined;
  protected origin: Origin;
  protected authStore: Public<AuthStore>;

  constructor(args: {
    origin: VQClient['origin'];
    authStore: VQClient['authStore'];
  }) {
    this.origin = args.origin;
    this.authStore = args.authStore;
  }

  get resort(): Resort {
    return ORIGIN_TO_RESORT[this.origin];
  }

  url(resource: VQResource): string {
    return `${this.origin}/application/v1/guest/${resource}`;
  }

  async getQueues(): Promise<Queue[]> {
    return (
      (await fetchJson(this.url('getQueues'))).data.queues as GetQueuesResponse
    ).map(({ queueId, ...queue }) => ({ ...queue, id: queueId }));
  }

  async getQueue(queue: Pick<Queue, 'id'>): Promise<Queue> {
    const q = (await this.getQueues()).find(q => q.id === queue.id);
    if (q) return q;
    throw new Error('Queue not Found');
  }

  async getLinkedGuests(queue: Pick<Queue, 'id'>): Promise<Guest[]> {
    const { data } = await this.post<GetLinkedGuestsOKResponse>({
      resource: 'getLinkedGuests',
      data: { queueId: queue.id },
    });
    return sortGuests(
      data.guests.map(({ guestId, firstName, lastName, ...guest }) => ({
        ...guest,
        id: guestId,
        name: `${firstName} ${lastName}`.trim(),
      }))
    );
  }

  async joinQueue(
    queue: Pick<Queue, 'id'>,
    guests: Pick<Guest, 'id'>[]
  ): Promise<JoinQueueResult> {
    const guestIds = guests.map(g => g.id);
    const { status, data } = await this.post<JoinQueueResponse>({
      resource: 'joinQueue',
      data: { queueId: queue.id, guestIds },
    });
    if (data.responseStatus === 'OK') {
      const pos = data.positions.find(
        p =>
          p.queueId === queue.id &&
          p.guestIds.length > 0 &&
          guestIds.some(gid => p.guestIds.includes(gid))
      );
      if (!pos) throw new RequestError({ status, data });
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
      throw new RequestError({ status, data });
    }
  }

  logOut(): void {
    this.authStore.deleteData();
    this.onUnauthorized();
  }

  protected async post<T>(
    request: VQRequest
  ): Promise<{ status: number; data: T }> {
    const { status, data } = await fetchJson(this.url(request.resource), {
      method: 'POST',
      headers: {
        Authorization: `BEARER ${this.authStore.getData().accessToken}`,
      },
      data: request.data,
    });
    if (status === 401) setTimeout(() => this.logOut());
    if (!status || status === 401 || status >= 500) {
      throw new RequestError({ status, data });
    }
    return { status, data };
  }
}
