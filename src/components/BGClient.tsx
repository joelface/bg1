import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { sleep } from '../sleep';
import { Guest, Queue, ApiClient } from '../virtual-queue';
import ChooseParty from './ChooseParty';
import Flash, { useFlash } from './Flash';
import JoinQueue from './JoinQueue';
import QueueSelector from './QueueSelector';
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
  const [party, setParty] = useState<Set<Guest>>(new Set());
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
        setParty(new Set(guests.filter(g => g.isPreselected)));
      }
    })();
    return () => {
      canceled = true;
    };
  }, [client, queue]);

  useEffect(() => {
    scrollTo(0, 0);
  }, [screenName]);

  function toggleGuest(guest: Guest) {
    const newParty = new Set(party);
    party.has(guest) ? newParty.delete(guest) : newParty.add(guest);
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
      const { boardingGroup } = await client.joinQueue(queue, [...party]);
      alert(`Boarding Group: ${boardingGroup}`);
    } else {
      flash('Queue not open yet');
    }
    await sleepDone;
  }

  const screens = {
    ChooseParty: (
      <ChooseParty
        guests={guests}
        isSelected={g => party.has(g)}
        onToggle={toggleGuest}
        onConfirm={() => show('JoinQueue')}
      />
    ),
    JoinQueue: (
      <JoinQueue
        guests={[...party]}
        onEdit={() => show('ChooseParty')}
        onJoin={joinQueue}
      />
    ),
  };

  return queue && guests.length ? (
    <>
      <h1 className="border-b-2 border-gray-200">
        <QueueSelector
          queues={queues}
          selected={queue}
          onChange={changeQueue}
        />
      </h1>
      <TimeBoard queue={queue} />
      {screens[screenName]}
      <Flash {...flashProps} />
    </>
  ) : null;
}
