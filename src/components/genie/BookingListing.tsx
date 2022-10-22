import { Booking } from '@/api/genie';
import { returnTime } from '@/datetime';

export default function BookingListing({
  booking,
  button,
  badge,
}: {
  booking: Booking;
  button?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-x-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-x-2 text-gray-500 text-sm font-semibold uppercase">
          {badge}
          {returnTime(booking)}
        </div>
        <div className="text-lg font-semibold leading-tight truncate">
          {booking.choices ? 'Multiple Experiences' : booking.name}
        </div>
      </div>
      {button && <div>{button}</div>}
    </div>
  );
}
