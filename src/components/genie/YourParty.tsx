import { useState } from 'react';

import { useGenieClient } from '/contexts/GenieClient';
import { useParty } from '/contexts/Party';
import useFlash from '/hooks/useFlash';
import Button from '../Button';
import FloatingButton from '../FloatingButton';
import GuestList, { Guest } from '../GuestList';
import Warning from '../Warning';
import IneligibleGuestList from './IneligibleGuestList';

export default function YourParty({
  buttonText,
  onSubmit,
}: {
  buttonText: React.ReactNode;
  onSubmit: () => void;
}) {
  const { eligible, ineligible, selected, setSelected } = useParty();
  const [party, setParty] = useState<Set<Guest>>();
  const [flashElem, flash] = useFlash();
  const { maxPartySize } = useGenieClient();

  const toggleGuest = (guest: Guest) =>
    setParty(party => {
      flash('');
      party = new Set(party);
      const method = party.has(guest) ? 'delete' : 'add';
      if (method === 'add' && party.size >= maxPartySize) {
        flash(`Maximum party size: ${maxPartySize}`);
      } else {
        party[method](guest);
      }
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
      {flashElem}
    </>
  ) : (
    <>
      {eligible.length > maxPartySize && (
        <Warning>Party size restricted</Warning>
      )}
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
