import { Guest } from '/api/vq';
import FloatingButton from '../FloatingButton';
import GuestList from '../GuestList';
import LogoutButton from '../LogoutButton';

export default function ChooseParty({
  guests,
  party,
  onToggle,
  onConfirm,
}: {
  guests?: Guest[];
  party: Set<Guest>;
  onToggle: (guest: Guest) => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <div className="mt-5">
        <h2 className="inline mr-3 text-xl">Choose Your Party</h2>
        <LogoutButton />
      </div>
      {!guests ? (
        <p>Loading guests…</p>
      ) : guests.length > 0 ? (
        <GuestList
          guests={guests}
          selectable={{ isSelected: g => party.has(g), onToggle }}
        />
      ) : (
        <p>No guests available</p>
      )}
      <FloatingButton disabled={party.size === 0} onClick={onConfirm}>
        Confirm Party
      </FloatingButton>
    </>
  );
}
