import { useEffect, useState } from 'react';

import { Guest, Queue } from '@/api/vq';
import FloatingButton from '@/components/FloatingButton';
import GuestList from '@/components/GuestList';
import { useNav } from '@/contexts/Nav';
import { useResort } from '@/contexts/Resort';
import useDataLoader from '@/hooks/useDataLoader';

import JoinQueue from './JoinQueue';
import QueueScreen from './QueueScreen';

export default function ChooseParty({ queue }: { queue: Queue }) {
  const { goTo } = useNav();
  const { vq } = useResort();
  const { loadData, loaderElem } = useDataLoader();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [party, setParty] = useState<Set<Guest>>(new Set());

  useEffect(() => {
    loadData(async () => {
      const guests = await vq.getLinkedGuests(queue);
      setGuests(guests);
      setParty(new Set(guests.filter(g => g.preselected)));
    });
  }, [queue, vq, loadData]);

  function toggleGuest(guest: Guest) {
    party[party.has(guest) ? 'delete' : 'add'](guest);
    setParty(new Set(party));
  }

  return (
    <QueueScreen queue={queue} title="Choose Your Party">
      {queue.howToEnterMessage.split('\n\n').map((graf, i) => (
        <p key={i}>{graf}</p>
      ))}
      <h3>Choose Your Party</h3>
      {guests.length > 0 ? (
        <GuestList
          guests={guests}
          selectable={{
            isSelected: g => party.has(g),
            onToggle: toggleGuest,
            limit: queue.maxPartySize,
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
