import { Booking } from '@/api/itinerary';
import { useBookingDate } from '@/contexts/BookingDate';
import { parkDate } from '@/datetime';

import { Time } from '../Time';

export default function BookingDate({
  booking,
}: {
  booking?: Pick<Booking, 'start'>;
}) {
  const { bookingDate } = useBookingDate();
  return <Time date={booking ? parkDate(booking.start) : bookingDate} />;
}
