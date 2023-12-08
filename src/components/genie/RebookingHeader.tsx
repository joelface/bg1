import { useRebooking } from '@/contexts/Rebooking';
import { useTheme } from '@/contexts/Theme';

import Button from '../Button';
import BookingListing from './BookingListing';
import Home from './screens/Home';

export default function RebookingHeader() {
  const rebooking = useRebooking();
  const theme = useTheme();
  if (!rebooking.current) return null;
  return (
    <div className={`sticky top-0 -mx-3 pb-1 ${theme.bg}`}>
      <div className="pb-3 bg-white">
        <div
          className={`pb-1 ${theme.bg} text-white text-sm font-semibold uppercase text-center`}
        >
          Modifying Reservation
        </div>
        <div className="mt-2 px-3">
          <BookingListing
            booking={rebooking.current}
            button={
              <Button
                type="small"
                back={{ screen: Home }}
                onClick={rebooking.end}
              >
                Keep
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
