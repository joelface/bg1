import { h } from 'preact';

import { Booking } from '@/api/genie';
import { displayTime } from '@/datetime';

export default function BookingListing({
  booking,
  button,
}: {
  booking: Booking;
  button?: h.JSX.Element;
}) {
  return (
    <div className="flex items-center gap-x-2">
      <div className="flex-1 min-w-0">
        <div className="text-gray-500 text-sm font-semibold uppercase">
          <time>{displayTime(booking.start.time)}</time> -{' '}
          {booking.end.time ? (
            <time>{displayTime(booking.end.time)}</time>
          ) : (
            'close'
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
