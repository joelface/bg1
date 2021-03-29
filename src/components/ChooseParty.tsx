import { h, Fragment } from 'preact';

import { Guest } from '../virtual-queue';
import FloatingButton from './FloatingButton';
import GuestList from './GuestList';

export default function ChooseParty({
  guests,
  isSelected,
  onToggle,
  onConfirm,
}: {
  guests: Guest[];
  isSelected: (guest: Guest) => boolean;
  onToggle: (guest: Guest) => void;
  onConfirm: () => void;
}): h.JSX.Element {
  return (
    <>
      <h2 className="mt-5 text-xl">Choose Your Party</h2>
      <GuestList guests={guests} selectable={{ isSelected, onToggle }} />
      <FloatingButton
        disabled={!guests.some(g => isSelected(g))}
        onClick={onConfirm}
      >
        Confirm Party
      </FloatingButton>
    </>
  );
}
