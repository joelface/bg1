import { Booking } from '@/api/itinerary';
import { useTheme } from '@/contexts/Theme';

import ReturnWindow from './ReturnWindow';

const DOT = <span aria-hidden>•</span>;

export default function BookingListing({
  booking,
  button,
}: {
  booking: Booking;
  button?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <div className="flex items-center gap-x-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-x-2 text-gray-500 text-sm font-semibold uppercase whitespace-nowrap">
          {booking.type === 'DAS' && (
            <>
              <span>DAS</span>
              {DOT}
            </>
          )}
          {booking.type === 'BG' ? (
            <>
              <span>BG {booking.boardingGroup}</span>
              {booking.status === 'SUMMONED' && (
                <>
                  {DOT}
                  <span className={`${theme.text} font-bold`}>Board Now</span>
                </>
              )}
            </>
          ) : (
            <ReturnWindow {...booking} />
          )}
        </div>
        <div className="text-lg font-semibold leading-snug truncate">
          {booking.choices ? 'Multiple Experiences' : booking.name}
        </div>
      </div>
      {button && <div>{button}</div>}
    </div>
  );
}
