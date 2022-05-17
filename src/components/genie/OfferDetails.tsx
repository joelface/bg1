import { h, Fragment } from 'preact';

import { Offer } from '@/api/genie';
import { useRebooking } from '@/contexts/Rebooking';
import ArrivalTimes from './ArrivalTimes';
import YourParty from './YourParty';

export default function OfferDetails({
  offer,
  onBook: onBook,
}: {
  offer: Offer;
  onBook: () => void;
}): h.JSX.Element {
  const rebooking = useRebooking();

  return (
    <>
      {rebooking.current && (
        <p className="border-2 rounded border-red-600 p-1 font-semibold text-center text-red-600 bg-red-100">
          Rebooking resets the two hour timer
        </p>
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
