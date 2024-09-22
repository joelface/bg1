import FloatingButton from '@/components/FloatingButton';
import Notice from '@/components/Notice';
import { Time } from '@/components/Time';
import { useBookingDate } from '@/contexts/BookingDate';
import { useClients } from '@/contexts/Clients';
import { useNav } from '@/contexts/Nav';
import { useRebooking } from '@/contexts/Rebooking';
import { DateTime, parkDate } from '@/datetime';

import IneligibleGuestList from '../../IneligibleGuestList';

export default function NoEligibleGuests() {
  const { goBack } = useNav();
  const { ll } = useClients();
  const rebooking = useRebooking();
  const { bookingDate, setBookingDate } = useBookingDate();
  const today = parkDate();
  return (
    <>
      {rebooking.current ? (
        <>
          <h3>Unable to Modify</h3>
          <p>
            Your current reservation cannot be modified to this experience due
            to the following conflicts:
          </p>
        </>
      ) : (
        <>
          {ll.nextBookTime &&
            ll.nextBookTime.slice(0, 5) > new DateTime().time.slice(0, 5) && (
              <Notice>
                Eligible at <Time time={ll.nextBookTime} />
              </Notice>
            )}
          <h3>No Eligible Guests</h3>
          <p>
            No one in your party is currently eligible for this Lightning Lane.
          </p>
        </>
      )}
      <IneligibleGuestList />
      {bookingDate !== today && (
        <FloatingButton
          onClick={() => {
            setBookingDate(today);
            goBack();
          }}
        >
          Switch to Today
        </FloatingButton>
      )}
    </>
  );
}
