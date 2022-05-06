import { h } from 'preact';
import { useState } from 'preact/hooks';

import { Booking, BookingGuest } from '@/api/genie';
import Button from '../Button';
import FloatingButton from '../FloatingButton';
import GuestList from '../GuestList';
import Page from '../Page';
import ArrivalTimes from './ArrivalTimes';
import CancelGuests from './CancelGuests';
import { useRebooking } from '@/contexts/Rebooking';

export default function BookingDetails({
  booking,
  onClose,
  isRebookable,
  isNew,
}: {
  booking: Booking;
  onClose: (newGuests: BookingGuest[]) => void;
  isRebookable?: boolean;
  isNew?: boolean;
}): h.JSX.Element {
  const rebooking = useRebooking();
  const [guests, setGuests] = useState(booking.guests);
  const [canceling, setCanceling] = useState(false);

  if (canceling) {
    return (
      <CancelGuests
        booking={{ ...booking, guests }}
        onClose={newGuests => {
          setCanceling(false);
          if (newGuests.length > 0) {
            setGuests(newGuests);
          } else {
            onClose(newGuests);
          }
        }}
      />
    );
  }

  return (
    <Page
      heading="Your Lightning Lane"
      theme={booking.park.theme}
      buttons={
        isRebookable && (
          <Button onClick={() => rebooking.begin(booking)}>Rebook</Button>
        )
      }
    >
      <h2>{booking.experience.name}</h2>
      <div>{booking.park.name}</div>
      <ArrivalTimes times={booking} />
      <div className="flex mt-4">
        <h3 className="inline mt-0">Your Party</h3>
        <Button
          type="small"
          onClick={() => setCanceling(true)}
          className="ml-3"
        >
          Cancel
        </Button>
      </div>
      <GuestList guests={guests} />
      <FloatingButton onClick={() => onClose(guests)}>
        {isNew ? 'Done' : 'Back'}
      </FloatingButton>
    </Page>
  );
}
