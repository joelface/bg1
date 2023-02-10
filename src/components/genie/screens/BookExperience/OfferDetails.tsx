import { Offer } from '@/api/genie';
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
        buttonText={`${rebooking.current ? 'Modify' : 'Book'} Lightning Lane`}
        onSubmit={onBook}
      />
    </>
  );
}
