import { h, Fragment } from 'preact';

import { Guest } from '../virtual-queue';
import FloatingButton from './FloatingButton';
import GuestList from './GuestList';

interface ChoosePartyProps {
  guests: Guest[];
  isSelected: (guest: Guest) => boolean;
  onToggle: (guest: Guest) => void;
  onConfirm: () => void;
}

export default function ChooseParty({
  guests,
  isSelected,
  onToggle,
  onConfirm,
}: ChoosePartyProps): h.JSX.Element {
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
