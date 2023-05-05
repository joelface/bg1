import { useEffect, useState } from 'react';

import { Guest, Queue } from '@/api/vq';
import FloatingButton from '@/components/FloatingButton';
import GuestList from '@/components/GuestList';
import { useNav } from '@/contexts/Nav';
import { useVQClient } from '@/contexts/VQClient';
import useDataLoader from '@/hooks/useDataLoader';

import StartTime from '../StartTime';
import JoinQueue from './JoinQueue';
import QueueScreen from './QueueScreen';

export default function ChooseParty({ queue }: { queue: Queue }) {
  const { goTo } = useNav();
  const client = useVQClient();
  const { loadData, loaderElem, flash } = useDataLoader();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [party, setParty] = useState<Set<Guest>>(new Set());

  useEffect(() => {
    loadData(async () => {
      const guests = await client.getLinkedGuests(queue);
      setGuests(guests);
      setParty(new Set(guests.filter(g => g.preselected)));
    });
  }, [queue, client, loadData]);

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

  return (
    <QueueScreen queue={queue} heading="Choose Your Party">
      {queue.howToEnterMessage.split('\n\n').map((graf, i) => (
        <p key={i}>{graf}</p>
      ))}
      <StartTime queue={queue} screen={ChooseParty} />
      <h3>Choose Your Party</h3>
      {guests.length > 0 ? (
        <GuestList
          guests={guests}
          selectable={{
            isSelected: g => party.has(g),
            onToggle: toggleGuest,
          }}
        />
      ) : (
        <p>No guests available</p>
      )}
      <FloatingButton
        disabled={party.size === 0}
        onClick={() => goTo(<JoinQueue queue={queue} guests={[...party]} />)}
      >
        Confirm Party
      </FloatingButton>
      {loaderElem}
    </QueueScreen>
  );
}
