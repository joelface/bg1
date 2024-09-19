import { useEffect, useState } from 'react';

import { LightningLane, Offer } from '@/api/ll';
import Button from '@/components/Button';
import FloatingButton from '@/components/FloatingButton';
import GuestList from '@/components/GuestList';
import Screen from '@/components/Screen';
import { useClients } from '@/contexts/Clients';
import { useNav } from '@/contexts/Nav';
import { usePlans } from '@/contexts/Plans';
import { useRebooking } from '@/contexts/Rebooking';
import { useResort } from '@/contexts/Resort';
import useDataLoader from '@/hooks/useDataLoader';
import { ping } from '@/ping';

import BookingDate from '../BookingDate';
import RebookingHeader from '../RebookingHeader';
import ReturnTime from '../ReturnTime';
import BookingDetails from './BookingDetails';
import Home from './Home';
import SelectReturnTime from './SelectReturnTime';

export default function BookNewReturnTime({
  offer: initialOffer,
}: {
  offer: Offer<LightningLane>;
}) {
  const rebooking = useRebooking();
  const { goTo, goBack } = useNav();
  const resort = useResort();
  const { ll } = useClients();
  const { loadData, loaderElem } = useDataLoader();
  const { refreshPlans } = usePlans();
  const [offer, setOffer] = useState(initialOffer);

  useEffect(() => {
    const begin = rebooking.begin;
    begin(initialOffer.booking);
    return rebooking.end;
  }, [initialOffer, rebooking.begin, rebooking.end]);

  function book() {
    loadData(async () => {
      const booking = await ll.book(offer);
      refreshPlans();
      await goBack({ screen: Home });
      goTo(<BookingDetails booking={booking} isNew />);
      ping(resort, 'G');
    });
  }

  return (
    <Screen
      title="Lightning Lane"
      subhead={
        <>
          <RebookingHeader />
          <BookingDate booking={offer.booking} />
        </>
      }
      theme={offer.experience.park.theme}
    >
      <h2>{offer.experience.name}</h2>
      <div>{offer.experience.park.name}</div>
      <ReturnTime
        {...offer}
        button={
          <Button
            type="small"
            onClick={() => {
              goTo(<SelectReturnTime offer={offer} onOfferChange={setOffer} />);
            }}
          >
            Change
          </Button>
        }
      />
      <h3>Your Party</h3>
      <GuestList guests={offer.guests.eligible} />
      {loaderElem}
      <FloatingButton onClick={book}>Modify Lightning Lane</FloatingButton>
    </Screen>
  );
}
