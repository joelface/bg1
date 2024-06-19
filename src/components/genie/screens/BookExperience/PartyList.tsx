import Button from '@/components/Button';
import GuestList from '@/components/GuestList';
import Warning from '@/components/Warning';
import { useNav } from '@/contexts/Nav';
import { useParty } from '@/contexts/Party';
import { useResort } from '@/contexts/Resort';

import IneligibleGuestList from '../../IneligibleGuestList';
import ModifyParty from '../ModifyParty';

export default function PartyList({ button }: { button?: JSX.Element }) {
  const { goTo } = useNav();
  const party = useParty();
  const { eligible, selected } = party;
  const { maxPartySize } = useResort().genie;
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
      {button}
    </>
  );
}
