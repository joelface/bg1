import { Offer } from '@/api/genie';
import FloatingButton from '@/components/FloatingButton';
import { useRebooking } from '@/contexts/Rebooking';

import ReturnTime from '../../ReturnTime';
import PartyList from './PartyList';

export default function OfferDetails({
  offer,
  onBook: onBook,
}: {
  offer: Offer;
  onBook: () => void;
}) {
  const rebooking = useRebooking();

  return (
    <>
      <ReturnTime {...offer} />
      {offer.changed && (
        <div className="text-sm">
          <strong>Note:</strong> Return time has been changed
        </div>
      )}
      <PartyList
        button={
          <FloatingButton onClick={onBook}>{`${
            rebooking.current ? 'Modify' : 'Book'
          } Lightning Lane`}</FloatingButton>
        }
      />
    </>
  );
}
