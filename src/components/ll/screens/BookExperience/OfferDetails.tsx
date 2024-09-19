import { Offer } from '@/api/ll';
import Button from '@/components/Button';
import { useClients } from '@/contexts/Clients';
import { useNav } from '@/contexts/Nav';

import ReturnTime from '../../ReturnTime';
import SelectReturnTime from '../SelectReturnTime';
import PartyList from './PartyList';

export default function OfferDetails({
  offer,
  onOfferChange,
}: {
  offer: Offer;
  onOfferChange: (offer: Offer) => void;
}) {
  const { goTo } = useNav();
  const { ll } = useClients();
  return (
    <>
      <div className="flex items-center">
        <ReturnTime
          {...offer}
          button={
            ll.rules.timeSelect && (
              <Button
                type="small"
                onClick={() =>
                  goTo(
                    <SelectReturnTime
                      offer={offer}
                      onOfferChange={onOfferChange}
                    />
                  )
                }
              >
                Change
              </Button>
            )
          }
        />
      </div>
      {offer.changed && (
        <div className="text-sm">
          <strong>Note:</strong> Return time has been changed
        </div>
      )}
      <PartyList />
    </>
  );
}
