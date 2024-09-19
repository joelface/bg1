import Button from '@/components/Button';
import GuestList from '@/components/GuestList';
import Warning from '@/components/Warning';
import { useClients } from '@/contexts/Clients';
import { useNav } from '@/contexts/Nav';
import { useParty } from '@/contexts/Party';

import IneligibleGuestList from '../../IneligibleGuestList';
import ModifyParty from '../ModifyParty';

export default function PartyList() {
  const { goTo } = useNav();
  const party = useParty();
  const { eligible, selected } = party;
  const { maxPartySize } = useClients().ll.rules;
  return (
    <>
      {eligible.length > maxPartySize && selected.length === maxPartySize && (
        <Warning>Party size restricted</Warning>
      )}
      {selected.length > 0 ? (
        <>
          <div className="mt-4">
            <h3 className="inline mt-0">Your Party</h3>
            <Button
              type="small"
              onClick={() => goTo(<ModifyParty party={party} />)}
              className="ml-3"
            >
              Modify
            </Button>
          </div>
          <GuestList guests={selected} />
        </>
      ) : (
        <>
          <h3>Ineligible Guests</h3>
          <IneligibleGuestList />
        </>
      )}
    </>
  );
}
