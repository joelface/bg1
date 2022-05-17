import { h, Fragment, ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';

import { useParty } from '@/contexts/Party';
import Button from '../Button';
import FloatingButton from '../FloatingButton';
import GuestList, { Guest } from '../GuestList';
import IneligibleGuestList from './IneligibleGuestList';

export default function YourParty({
  buttonText,
  onSubmit,
}: {
  buttonText: ComponentChildren;
  onSubmit: () => void;
}) {
  const { eligible, ineligible, selected, setSelected } = useParty();
  const [party, setParty] = useState<Set<Guest>>();

  const toggleGuest = (guest: Guest) =>
    setParty(party => {
      party = new Set(party);
      party[party.has(guest) ? 'delete' : 'add'](guest);
      return party;
    });

  return party ? (
    <>
      <h3>Choose Your Party</h3>
      <GuestList
        guests={eligible}
        selectable={{
          isSelected: g => party.has(g),
          onToggle: toggleGuest,
        }}
      />
      {ineligible.length > 0 && (
        <>
          <h3>Ineligible Guests</h3>
          <IneligibleGuestList />
        </>
      )}
      <FloatingButton
        disabled={party.size === 0}
        onClick={() => {
          setSelected([...party]);
          setParty(undefined);
        }}
      >
        Confirm Party
      </FloatingButton>
    </>
  ) : (
    <>
      <div className="mt-4">
        <h3 className="inline mt-0">Your Party</h3>
        <span>
          <Button
            type="small"
            onClick={() => setParty(new Set(selected))}
            className="ml-3"
          >
            Edit
          </Button>
        </span>
      </div>
      <GuestList guests={selected} />
      <FloatingButton onClick={onSubmit}>{buttonText}</FloatingButton>
    </>
  );
}
