import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { Guest, Queue, JoinQueueResult } from '@/api/vq';
import { useVQClient } from '@/contexts/VQClient';
import useFlash from '@/hooks/useFlash';
import Page from '../Page';
import TimeBoard from '../TimeBoard';
import BGResult from './BGResult';
import ChooseParty from './ChooseParty';
import HowToEnter from './HowToEnter';
import JoinQueue from './JoinQueue';
import QueueHeading from './QueueHeading';

export default function BGClient(): h.JSX.Element | null {
  const client = useVQClient();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [party, setParty] = useState<Set<Guest>>(new Set());
  const [joinResult, setJoinResult] = useState<JoinQueueResult>({
    boardingGroup: null,
    conflicts: {},
    closed: true,
  });
  const [screenName, show] = useState<keyof typeof screens>('ChooseParty');
  const [flashElem, flash] = useFlash();
  const pageElem = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const queues = await client.getQueues();
      setQueues(queues);
      setQueue(queues[0]);
    })();
  }, [client]);

  useEffect(() => {
    if (!queue) return;
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
  }, [client, queue]);

  useEffect(() => {
    pageElem.current?.scroll(0, 0);
  }, [screenName]);

  function toggleGuest(guest: Guest) {
    const newParty = new Set(party);
    newParty[newParty.has(guest) ? 'delete' : 'add'](guest);
    const maxPartySize = Number(queue?.maxPartySize);
    if (maxPartySize > 0 && newParty.size > maxPartySize) {
      flash(`Max party size: ${maxPartySize}`, 'error');
    } else {
      setParty(newParty);
      flash('');
    }
  }

  function changeQueue(queueId: string) {
    const q = queues.find(q => q.id === queueId);
    if (q) setQueue(q);
  }

  async function joinQueue() {
    if (!queue || !(await client.getQueue(queue)).isAcceptingJoins) {
      return false;
    }
    setJoinResult(await client.joinQueue(queue, [...party]));
    show('BGResult');
    return true;
  }

  if (!queue) return null;
  const partyGuests = guests.filter(g => party.has(g));
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
