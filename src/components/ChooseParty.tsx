import { h, Fragment } from 'preact';

import { Guest } from '../virtual-queue';
import FloatingButton from './FloatingButton';
import GuestList from './GuestList';

export default function ChooseParty({
  guests,
  party,
  onToggle,
  onConfirm,
}: {
  guests: Guest[];
  party: Guest[];
  onToggle: (i: number) => void;
  onConfirm: () => void;
}): h.JSX.Element {
  return (
    <>
      <h2 className="mt-5 text-xl">Choose Your Party</h2>
      <GuestList
        guests={guests}
        selectable={{ isSelected: i => !!party[i], onToggle }}
      />
      <FloatingButton
        disabled={Object.keys(party).length === 0}
        onClick={onConfirm}
      >
        Confirm Party
      </FloatingButton>
    </>
  );
}
