import { useCallback, useEffect, useRef, useState } from 'react';

import { Guest, Queue, JoinQueueResult } from '/api/vq';
import { useVQClient } from '/contexts/VQClient';
import useFlash from '/hooks/useFlash';
import Page from '../Page';
import TimeBoard from '../TimeBoard';
import BGResult from './BGResult';
import ChooseParty from './ChooseParty';
import HowToEnter from './HowToEnter';
import JoinQueue from './JoinQueue';
import QueueHeading from './QueueHeading';
import FloatingButton from '../FloatingButton';

const isAttraction = (queue: Queue) => queue.categoryContentId === 'attraction';

export default function BGClient() {
  const client = useVQClient();
  const [queues, setQueues] = useState<Queue[]>();
  const [queue, setQueue] = useState<Queue | null>(null);
  const [guests, setGuests] = useState<Guest[]>();
  const [party, setParty] = useState<Set<Guest>>(new Set());
  const [joinResult, setJoinResult] = useState<JoinQueueResult>({
    boardingGroup: null,
    conflicts: {},
    closed: true,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [screenName, show] = useState<keyof typeof screens>('ChooseParty');
  const [flashElem, flash] = useFlash();
  const pageElem = useRef<HTMLDivElement | null>(null);

  const refreshQueues = useCallback(async () => {
    flash('');
    setRefreshing(true);
    const queues = (await client.getQueues())
      .filter(q => q.isAcceptingJoins || q.isAcceptingPartyCreation)
      .sort(
        (a, b) =>
          +isAttraction(b) - +isAttraction(a) || a.name.localeCompare(b.name)
      );
    setRefreshing(false);
    setQueues(oldQueues => {
      if (oldQueues && queues.length === 0) {
        flash('No queues available');
      }
      return queues;
    });
  }, [client, flash]);

  useEffect(() => {
    refreshQueues();
    const updateIfVisible = () => {
      if (!document.hidden) refreshQueues();
    };
    document.addEventListener('visibilitychange', updateIfVisible);
    return () => {
      document.removeEventListener('visibilitychange', updateIfVisible);
    };
  }, [refreshQueues]);

  useEffect(() => {
    setQueue(queue => {
      const sameQueue = queue && queues?.find(q => q.id === queue.id);
      if (sameQueue) return sameQueue;
      setGuests(undefined);
      return queues && queues.length > 0 ? queues[0] : null;
    });
  }, [queues]);

  useEffect(() => {
    if (guests || !queue) return;
    let canceled = false;
    (async () => {
      const guests = await client.getLinkedGuests(queue);
      if (!canceled) {
        setGuests(guests);
        setParty(new Set(guests.filter(g => g.isPreselected)));
      }
    })();
    return () => {
      canceled = true;
    };
  }, [client, queue, guests]);

  useEffect(() => {
    pageElem.current?.scroll(0, 0);
  }, [screenName]);

  function toggleGuest(guest: Guest) {
    const newParty = new Set(party);
    newParty[newParty.has(guest) ? 'delete' : 'add'](guest);
    const maxPartySize = Number(queue?.maxPartySize);
    if (maxPartySize > 0 && newParty.size > maxPartySize) {
      flash(`Maximum party size: ${maxPartySize}`);
    } else {
      setParty(newParty);
      flash('');
    }
  }

  function changeQueue(queueId: string) {
    const q = queues?.find(q => q.id === queueId);
    if (q) {
      setQueue(q);
      setGuests(undefined);
    }
  }

  async function joinQueue() {
    if (!queue || !(await client.getQueue(queue)).isAcceptingJoins) {
      return false;
    }
    setJoinResult(await client.joinQueue(queue, [...party]));
    show('BGResult');
    return true;
  }

  if (queues?.length === 0) {
    return (
      <Page heading="No Active Queues">
        <p>
          You can't join any virtual queues just yet. Check back within an hour
          of the queue opening time, or tap the Refresh button to check again.
        </p>
        <FloatingButton disabled={refreshing} onClick={refreshQueues}>
          Refresh
        </FloatingButton>
        {flashElem}
      </Page>
    );
  }

  if (!queue) return <div />;

  const partyGuests = (guests || []).filter(g => party.has(g));
  const timeBoard = (
    <TimeBoard
      resort={client.resort}
      time={queue.nextScheduledOpenTime}
      label="Next queue opening"
    />
  );
  const heading = (
    <QueueHeading
      queue={queue}
      queues={screenName === 'ChooseParty' ? queues : []}
      onChange={changeQueue}
    />
  );

  const screens = {
    ChooseParty: (
      <Page heading={heading} containerRef={pageElem}>
        <HowToEnter queue={queue} />
        {timeBoard}
        <ChooseParty
          guests={guests}
          party={party}
          onToggle={toggleGuest}
          onConfirm={() => show('JoinQueue')}
        />
        {flashElem}
      </Page>
    ),
    JoinQueue: (
      <Page heading={heading}>
        {timeBoard}
        <JoinQueue
          guests={partyGuests}
          onEdit={() => show('ChooseParty')}
          joinQueue={joinQueue}
        />
      </Page>
    ),
    BGResult: (
      <Page heading={heading}>
        <BGResult
          guests={partyGuests}
          result={joinResult}
          onDone={() => show('ChooseParty')}
        />
      </Page>
    ),
  };

  return screens[screenName];
}
