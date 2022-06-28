import { Booking } from '@/api/genie';
import { displayTime } from '@/datetime';

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
      {badge}
      <div className="flex-1 min-w-0">
        <div className="text-gray-500 text-sm font-semibold uppercase">
          {booking.start.time ? (
            <time>{displayTime(booking.start.time)}</time>
          ) : (
            <span>open</span>
          )}
          {' - '}
          {booking.end.time ? (
            <time>{displayTime(booking.end.time)}</time>
          ) : (
            <span>close</span>
          )}
        </div>
        <div className="text-lg font-semibold leading-tight truncate">
          {booking.experience.name}
        </div>
      </div>
      {button && <div>{button}</div>}
    </div>
  );
}
