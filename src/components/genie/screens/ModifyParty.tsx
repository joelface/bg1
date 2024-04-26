import { useState } from 'react';

import FloatingButton from '@/components/FloatingButton';
import GuestList, { Guest } from '@/components/GuestList';
import Screen from '@/components/Screen';
import { useGenieClient } from '@/contexts/GenieClient';
import { Party, PartyProvider } from '@/contexts/Party';
import useFlash from '@/hooks/useFlash';

import IneligibleGuestList from '../IneligibleGuestList';

export default function ModifyParty({ party }: { party: Party }) {
  const { eligible, ineligible, selected, setSelected, experience } = party;
  const [newParty, setNewParty] = useState<Set<Guest>>(new Set(selected));
  const [flashElem, flash] = useFlash();
  const { maxPartySize } = useGenieClient();

  function toggleGuest(guest: Guest) {
    setNewParty(party => {
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
  }

  return (
    <PartyProvider value={party}>
      <Screen title="Modify Party" theme={experience.park.theme}>
        <h2>{experience.name}</h2>
        <div>{experience.park.name}</div>
        <h3>Your Party</h3>
        <GuestList
          guests={eligible}
          selectable={{
            isSelected: g => newParty.has(g),
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
          back
          disabled={newParty.size === 0}
          onClick={() => {
            setSelected(eligible.filter(g => newParty.has(g)));
          }}
        >
          Confirm Party
        </FloatingButton>
        {flashElem}
      </Screen>
    </PartyProvider>
  );
}
