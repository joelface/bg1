import { useState } from 'react';

import { LightningLane } from '@/api/genie';
import FloatingButton from '@/components/FloatingButton';
import GuestList from '@/components/GuestList';
import Screen from '@/components/Screen';
import { useGenieClient } from '@/contexts/GenieClient';
import { usePlans } from '@/contexts/Plans';
import useDataLoader from '@/hooks/useDataLoader';

import ReturnTime from '../ReturnTime';

export default function CancelGuests({
  booking,
  onCancel,
}: {
  booking: LightningLane;
  onCancel: (newGuests: LightningLane['guests']) => void;
}) {
  const client = useGenieClient();
  const { refreshPlans } = usePlans();
  const [guestsToCancel, setGuestsToCancel] = useState<
    Set<LightningLane['guests'][0]>
  >(new Set());
  const { loadData, loaderElem } = useDataLoader();

  const { name, park, guests } = booking;
  const cancelingNone = guestsToCancel.size === 0;
  const cancelingAll = guestsToCancel.size === guests.length;

  async function cancelGuests() {
    if (cancelingNone) return;
    await loadData(async () => {
      await client.cancelBooking([...guestsToCancel]);
      if (cancelingAll) refreshPlans();
    });
    onCancel(guests.filter(g => !guestsToCancel.has(g)));
  }

  return (
    <Screen heading="Cancel Guests" theme={park.theme}>
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
                const newGuests = new Set(guestsToCancel);
                newGuests.delete(g);
                setGuestsToCancel(newGuests);
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
              onToggle: g => setGuestsToCancel(new Set(guestsToCancel).add(g)),
            }}
          />
        </div>
      )}
      <FloatingButton back disabled={cancelingNone} onClick={cancelGuests}>
        {'Cancel ' + (cancelingAll ? 'Reservation' : 'Guests')}
      </FloatingButton>

      {loaderElem}
    </Screen>
  );
}
