import { useState } from 'react';

import { DasBooking, LightningLane } from '@/api/itinerary';
import FloatingButton from '@/components/FloatingButton';
import GuestList from '@/components/GuestList';
import Screen from '@/components/Screen';
import { useClients } from '@/contexts/Clients';
import { useNav } from '@/contexts/Nav';
import { usePlans } from '@/contexts/Plans';
import useDataLoader from '@/hooks/useDataLoader';

import ReturnTime from '../ReturnTime';

export default function CancelGuests<B extends LightningLane | DasBooking>({
  booking,
  onCancel,
  dasGuest,
}: {
  booking: B;
  onCancel: (newGuests: B['guests']) => void;
  dasGuest?: B['guests'][0];
}) {
  const { goBack } = useNav();
  const { ll, das } = useClients();
  const client = booking.type === 'DAS' ? das : ll;
  const { refreshPlans } = usePlans();
  const [guestsToCancel, setGuestsToCancel] = useState<
    Set<LightningLane['guests'][0]>
  >(new Set());
  const { loadData, loaderElem } = useDataLoader();

  const { name, park, guests } = booking;
  const cancelingNone = guestsToCancel.size === 0;
  const cancelingAll = guestsToCancel.size === guests.length;

  async function cancelBooking() {
    if (cancelingNone) return;
    await loadData(async () => {
      await client.cancelBooking([...guestsToCancel]);
      refreshPlans();
    });
    await goBack();
    onCancel(guests.filter(g => !guestsToCancel.has(g)));
  }

  return (
    <Screen title="Cancel Guests" theme={park.theme}>
      <h2>{name}</h2>
      <div>{park.name}</div>
      <ReturnTime {...booking} />
      <div className="ml-3">
        <label className="flex items-center py-4">
          <input
            type="checkbox"
            checked={cancelingAll}
            onChange={() =>
              setGuestsToCancel(new Set(cancelingAll ? [] : guests))
            }
          />
          <span className="ml-3">Select All</span>
        </label>
      </div>
      {!cancelingNone && (
        <div className="mb-4">
          <h3>Cancel These Guests</h3>
          <GuestList
            guests={guests.filter(g => guestsToCancel.has(g))}
            selectable={{
              isSelected: () => true,
              onToggle: g => {
                if (
                  dasGuest &&
                  g !== dasGuest &&
                  guestsToCancel.has(dasGuest)
                ) {
                  setGuestsToCancel(new Set());
                } else {
                  const newGuests = new Set(guestsToCancel);
                  newGuests.delete(g);
                  setGuestsToCancel(newGuests);
                }
              },
            }}
          />
        </div>
      )}
      {!cancelingAll && (
        <div>
          <h3>Select Guests to Cancel</h3>
          <GuestList
            guests={guests.filter(g => !guestsToCancel.has(g))}
            selectable={{
              isSelected: () => false,
              onToggle: g => {
                setGuestsToCancel(
                  new Set(g === dasGuest ? guests : guestsToCancel).add(g)
                );
              },
            }}
          />
        </div>
      )}
      <FloatingButton disabled={cancelingNone} onClick={cancelBooking}>
        {'Cancel ' + (cancelingAll ? 'Reservation' : 'Guests')}
      </FloatingButton>

      {loaderElem}
    </Screen>
  );
}
