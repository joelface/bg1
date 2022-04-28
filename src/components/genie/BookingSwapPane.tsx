import { h } from 'preact';
import { useBookingSwap } from '@/contexts/BookingSwap';
import { useTheme } from '@/contexts/Theme';
import Button from '../Button';
import BookingListing from './BookingListing';

export default function BookingSwapPane(): h.JSX.Element | null {
  const swap = useBookingSwap();
  const theme = useTheme();
  if (!swap.booking) return null;
  return (
    <aside className={`sticky top-0 -mx-3 pb-1 ${theme.bg}`}>
      <div className="pb-3 bg-white">
        <div
          className={`py-1.5 ${theme.bg} text-white text-sm font-semibold uppercase text-center`}
        >
          Modify Reservation
        </div>
        <div className="mt-2 px-3">
          <BookingListing
            booking={swap.booking}
            button={
              <Button type="small" onClick={swap.end}>
                Keep
              </Button>
            }
          />
        </div>
      </div>
    </aside>
  );
}
