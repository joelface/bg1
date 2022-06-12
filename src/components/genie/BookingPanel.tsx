import { useEffect, useState } from 'react';

import { Booking, BookingGuest } from '/api/genie';
import { useGenieClient } from '/contexts/GenieClient';
import Button from '../Button';
import Overlay from '../Overlay';
import Page from '../Page';
import BookingDetails from './BookingDetails';
import BookingListing from './BookingListing';

export default function BookingPanel({ onClose }: { onClose: () => void }) {
  const client = useGenieClient();
  const [bookings, setBookings] = useState<Booking[]>();
  const [booking, setBooking] = useState<Booking>();
  const [opened, setOpened] = useState(false);

  function closeDetails(newGuests: BookingGuest[]) {
    if (!booking) return;
    setBookings(bookings => {
      if (!bookings) return;
      if (newGuests.length > 0) {
        booking.guests = newGuests;
      } else {
        bookings.splice(bookings.indexOf(booking), 1);
      }
      return bookings;
    });
    setBooking(undefined);
  }

  useEffect(() => {
    setOpened(true);
    client.bookings().then(b => setBookings(b));
  }, [client]);

  function close() {
    setOpened(false);
    setTimeout(onClose, 300);
  }

  if (booking) {
    return (
      <BookingDetails
        booking={booking}
        onClose={closeDetails}
        isRebookable={client.isRebookable(booking)}
      />
    );
  }

  return (
    <>
      <Overlay
        onClick={close}
        data-testid="panel-shade"
        className={`bg-black bg-opacity-75`}
      />
      <Page
        heading="Your Lightning Lanes"
        buttons={<Button onClick={close}>Close</Button>}
        className={`top-auto max-h-[50%] ${
          opened ? 'h-[275px]' : 'h-0'
        } duration-200 ease-linear`}
      >
        {bookings && bookings.length > 0 ? (
          <ul>
            {(bookings || []).map(booking => (
              <li
                className="py-3 first:border-0 border-t-4 border-gray-300"
                key={booking.guests[0]?.entitlementId}
              >
                <BookingListing
                  booking={booking}
                  button={
                    <Button type="small" onClick={() => setBooking(booking)}>
                      More
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 text-sm font-semibold text-center uppercase  text-gray-500">
            {bookings && 'No current reservations'}
          </div>
        )}
      </Page>
    </>
  );
}
