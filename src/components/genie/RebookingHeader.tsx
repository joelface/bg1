import { useRebooking } from '@/contexts/Rebooking';

import Button from '../Button';
import BookingListing from './BookingListing';
import Home from './screens/Home';

export default function RebookingHeader() {
  const rebooking = useRebooking();
  if (!rebooking.current) return null;
  return (
    <div>
      <div className="-mx-3">
        <div className="pb-1">Modifying Reservation</div>
        <div className="px-3 py-2 bg-white text-black text-base font-normal normal-case text-left">
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
