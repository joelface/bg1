import { h, Fragment } from 'preact';

import { Guest } from '@/api/vq';
import FloatingButton from '../FloatingButton';
import GuestList from '../GuestList';

export default function ChooseParty({
  guests,
  party,
  onToggle,
  onConfirm,
}: {
  guests: Guest[];
  party: Set<Guest>;
  onToggle: (guest: Guest) => void;
  onConfirm: () => void;
}): h.JSX.Element {
  return (
    <>
      <h2 className="mt-5 text-xl">Choose Your Party</h2>
      <GuestList
        guests={guests}
        selectable={{ isSelected: g => party.has(g), onToggle }}
      />
      <FloatingButton disabled={party.size === 0} onClick={onConfirm}>
        Confirm Party
      </FloatingButton>
    </>
  );
}
