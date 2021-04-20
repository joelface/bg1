import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { sleep } from '../sleep';
import { Guest, Queue, JoinQueueResult, ApiClient } from '../virtual-queue';
import ChooseParty from './ChooseParty';
import Flash, { useFlash } from './Flash';
import JoinQueue from './JoinQueue';
import QueueHeading from './QueueHeading';
import BGResult from './BGResult';
import TimeBoard from './TimeBoard';

const JOIN_QUEUE_MIN_MS = 999;

export default function BGClient({
  client,
}: {
  client: Public<ApiClient>;
}): h.JSX.Element | null {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [party, setParty] = useState<Guest[]>([]);
  const [joinResult, setJoinResult] = useState<JoinQueueResult>({
    boardingGroup: null,
    conflicts: {},
    closed: true,
  });
  const [screenName, show] = useState<keyof typeof screens>('ChooseParty');
  const [flashProps, flash] = useFlash();

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
        const party = [];
        for (let i = 0; guests[i]?.isPreselected; ++i) party[i] = guests[i];
        setParty(party);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [client, queue]);

  useEffect(() => {
    scrollTo(0, 0);
  }, [screenName]);

  function toggleGuest(i: number) {
    const newParty = party.slice();
    newParty[i] ? delete newParty[i] : (newParty[i] = guests[i]);
    setParty(newParty);
  }

  function changeQueue(queueId: string) {
    const q = queues.find(q => q.queueId === queueId);
    if (q) setQueue(q);
  }

  async function joinQueue() {
    if (!queue) return;
    const sleepDone = sleep(JOIN_QUEUE_MIN_MS);
    flash('');
    if ((await client.getQueue(queue)).isAcceptingJoins) {
      try {
        setJoinResult(await client.joinQueue(queue, Object.values(party)));
      } catch (e) {
        flash('Error: try again', 'error');
        throw e;
      }
      show('BGResult');
    } else {
      flash('Queue not open yet');
    }
    await sleepDone;
  }

  if (!queue || guests.length === 0) return null;

  const screens = {
    ChooseParty: (
      <>
        <QueueHeading queue={queue} queues={queues} onChange={changeQueue} />
        <TimeBoard queue={queue} />
        <ChooseParty
          guests={guests}
          party={party}
          onToggle={toggleGuest}
          onConfirm={() => show('JoinQueue')}
        />
      </>
    ),
    JoinQueue: (
      <>
        <QueueHeading queue={queue} />
        <TimeBoard queue={queue} />
        <JoinQueue
          guests={Object.values(party)}
          onEdit={() => show('ChooseParty')}
          onJoin={joinQueue}
        />
        <Flash {...flashProps} />
      </>
    ),
    BGResult: (
      <>
        <QueueHeading queue={queue} />
        <BGResult
          guests={Object.values(party)}
          result={joinResult}
          onDone={() => show('ChooseParty')}
        />
      </>
    ),
  };

  return screens[screenName];
}
