import { useEffect, useState } from 'react';

import { Guest } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import { Spinner } from '@/hooks/useSpinner';
import Button from '../Button';
import FloatingButton from '../FloatingButton';
import GuestList from '../GuestList';
import Page from '../Page';

const PARTY_IDS_KEY = 'bg1.genie.partyIds';

export function loadPartyIds() {
  const partyIds = JSON.parse(localStorage.getItem(PARTY_IDS_KEY) || '[]');
  return Array.isArray(partyIds) ? partyIds : [];
}

export function useSelectedParty() {
  const client = useGenieClient();
  useEffect(() => client.setPartyIds(loadPartyIds()), [client]);
}

export default function PartySelector({ onClose }: { onClose: () => void }) {
  const client = useGenieClient();
  const [auto, setAuto] = useState(true);
  const [guests, setGuests] = useState<Guest[]>();
  const [partyIds, setPartyIds] = useState<Set<string>>(() => {
    const partyIds = new Set(loadPartyIds());
    setAuto(partyIds.size === 0);
    return partyIds;
  });

  function save() {
    const pids = [...partyIds];
    localStorage.setItem(PARTY_IDS_KEY, JSON.stringify(pids));
    client.setPartyIds(pids);
    onClose();
  }

  useEffect(() => {
    client.guests().then(g => {
      setGuests(
        [...g.eligible, ...g.ineligible].sort(
          (a, b) => +!a.primary - +!b.primary || a.name.localeCompare(b.name)
        )
      );
    });
  }, [client]);

  useEffect(() => {
    if (auto) setPartyIds(new Set());
  }, [auto]);

  const partyGuests = guests?.filter(g => partyIds.has(g.id));
  const nonpartyGuests = guests?.filter(g => !partyIds.has(g.id));

  const Mode = (props: { auto: boolean; children: string }) => (
    <li>
      <label className="flex items-center mt-2">
        <input
          type="radio"
          name="auto"
          onChange={() => setAuto(props.auto)}
          checked={auto === props.auto}
          className="mr-2"
        />{' '}
        {props.children}
      </label>
    </li>
  );

  return (
    <Page
      heading="Party Selection"
      buttons={<Button onClick={onClose}>Cancel</Button>}
    >
      <p>
        By default, all eligible guests (up to a maximum of 12) are
        automatically selected when you book a Lightning Lane. If you would like
        to limit who you book for, you can manually select your party here.
      </p>
      <ul>
        <Mode auto={true}>Book for all eligible guests</Mode>
        <Mode auto={false}>Only book for selected guests</Mode>
      </ul>

      {auto ? null : guests?.length === 0 ? (
        <p className="text-red-700">No guests to select</p>
      ) : partyGuests && nonpartyGuests ? (
        <>
          {partyGuests.length > 0 && (
            <>
              <h3>Your Party</h3>
              <GuestList
                guests={partyGuests}
                selectable={{
                  isSelected: () => true,
                  onToggle: g => {
                    const newPartyIds = new Set(partyIds);
                    newPartyIds.delete(g.id);
                    setPartyIds(newPartyIds);
                  },
                }}
              />
            </>
          )}
          {nonpartyGuests.length > 0 && (
            <>
              <h3>Add to Your Party</h3>
              <GuestList
                guests={nonpartyGuests}
                selectable={{
                  isSelected: () => false,
                  onToggle: g => {
                    const newPartyIds = new Set(partyIds);
                    newPartyIds.add(g.id);
                    setPartyIds(newPartyIds);
                  },
                }}
              />
            </>
          )}
        </>
      ) : (
        <Spinner />
      )}

      <FloatingButton disabled={!auto && partyIds.size === 0} onClick={save}>
        Save
      </FloatingButton>
    </Page>
  );
}
