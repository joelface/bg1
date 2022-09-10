import { useState } from 'react';

import { LightningLane } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import useDataLoader from '@/hooks/useDataLoader';
import FloatingButton from '../FloatingButton';
import GuestList from '../GuestList';
import Page from '../Page';
import ReturnTime from './ReturnTime';

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
    <Page heading="Your Lightning Lane" theme={park.theme}>
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
      {cancelingNone ? null : (
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
      {cancelingAll ? null : (
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
    </Page>
  );
}
