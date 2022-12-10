import { Booking } from '@/api/genie';
import { returnTime } from '@/datetime';

export default function BookingListing({
  booking,
  button,
}: {
  booking: Booking;
  button?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-x-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-x-2 text-gray-500 text-sm font-semibold uppercase">
          {booking.subtype === 'DAS' && (
            <>
              <span className={`px-1 rounded bg-gray-400 text-white`}>DAS</span>{' '}
            </>
          )}
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
