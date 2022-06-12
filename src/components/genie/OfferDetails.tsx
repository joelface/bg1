import { Offer } from '/api/genie';
import { useRebooking } from '/contexts/Rebooking';
import Warning from '../Warning';
import ArrivalTimes from './ArrivalTimes';
import YourParty from './YourParty';

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
      {rebooking.current && (
        <Warning>Rebooking resets the two hour timer</Warning>
      )}
      <ArrivalTimes times={offer} />
      {offer.changeStatus === 'PARK_HOPPING' && (
        <div className="text-sm">
          <strong>Note:</strong> Time changed due to park hopping
        </div>
      )}
      <YourParty
        buttonText={`${rebooking.current ? 'Rebook' : 'Book'} Lightning Lane`}
        onSubmit={onBook}
      />
    </>
  );
}
