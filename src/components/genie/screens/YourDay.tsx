import { useCallback, useEffect, useState } from 'react';

import { Booking, EntitledGuest } from '@/api/genie';
import Button from '@/components/Button';
import Screen from '@/components/Screen';
import { useGenieClient } from '@/contexts/GenieClient';
import { useNav } from '@/contexts/Nav';
import useDataLoader from '@/hooks/useDataLoader';
import RefreshIcon from '@/icons/RefreshIcon';

import BookingListing from '../BookingListing';
import BookingDetails from './BookingDetails';

export default function YourDay() {
  const { goTo } = useNav();
  const client = useGenieClient();
  const { loadData, loaderElem } = useDataLoader();
  const [bookings, setBookings] = useState<Booking[]>();

  function showBooking(booking: Booking) {
    goTo(
      <BookingDetails
        booking={booking}
        onClose={(newGuests: EntitledGuest[] | void) => {
          if (!newGuests) return;
          setBookings(bookings => {
            if (!bookings) return;
            if (newGuests.length > 0) {
              booking.guests = newGuests;
            } else {
              bookings.splice(bookings.indexOf(booking), 1);
            }
            return [...bookings];
          });
        }}
      />
    );
  }

  const refresh = useCallback(() => {
    loadData(async () => {
      setBookings(await client.bookings());
    });
  }, [client, loadData]);

  useEffect(refresh, [refresh]);

  return (
    <Screen
      heading="Your Day"
      buttons={
        <Button onClick={refresh} title="Refresh Plans">
          <RefreshIcon />
        </Button>
      }
    >
      {bookings && bookings.length > 0 ? (
        <ul>
          {(bookings || []).map(booking => (
            <li
              className="py-3 first:border-0 border-t-4 border-gray-300"
              key={booking.bookingId}
            >
              <BookingListing
                booking={booking}
                button={
                  <Button type="small" onClick={() => showBooking(booking)}>
                    Info
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
      {loaderElem}
    </Screen>
  );
}
