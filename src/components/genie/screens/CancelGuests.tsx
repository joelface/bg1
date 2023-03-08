import { useState } from 'react';

import { LightningLane } from '@/api/genie';
import FloatingButton from '@/components/FloatingButton';
import GuestList from '@/components/GuestList';
import Screen from '@/components/Screen';
import { useGenieClient } from '@/contexts/GenieClient';
import useDataLoader from '@/hooks/useDataLoader';

import ReturnTime from '../ReturnTime';

export default function CancelGuests({
  booking,
  onClose,
}: {
  booking: LightningLane;
  onClose: (newGuests: LightningLane['guests']) => void;
}) {
  const client = useGenieClient();
  const [guestsToCancel, setGuestsToCancel] = useState<
    Set<LightningLane['guests'][0]>
  >(new Set());
  const { loadData, loaderElem } = useDataLoader();

  const { guests } = booking;
  const cancelingNone = guestsToCancel.size === 0;
  const cancelingAll = guestsToCancel.size === guests.length;

  function cancelGuests() {
    loadData(async () => {
      if (!cancelingNone) {
        await client.cancelBooking([...guestsToCancel]);
      }
      onClose(guests.filter(g => !guestsToCancel.has(g)));
    });
  }

  const { name, park } = booking;

  return (
    <Screen heading="Your Lightning Lane" theme={park.theme}>
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
      <FloatingButton onClick={cancelGuests}>
        {cancelingNone
          ? 'Back'
          : 'Cancel ' + (cancelingAll ? 'Reservation' : 'Guests')}
      </FloatingButton>

      {loaderElem}
    </Screen>
  );
}
