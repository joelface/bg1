import Notice from '@/components/Notice';
import { Time } from '@/components/Time';
import { useRebooking } from '@/contexts/Rebooking';
import { useResort } from '@/contexts/Resort';
import { dateTimeStrings } from '@/datetime';

import IneligibleGuestList from '../../IneligibleGuestList';

export default function NoEligibleGuests() {
  const { genie } = useResort();
  const rebooking = useRebooking();
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
          {genie.nextBookTime &&
            genie.nextBookTime.slice(0, 5) >
              dateTimeStrings().time.slice(0, 5) && (
              <Notice>
                Eligible at <Time time={genie.nextBookTime} />
              </Notice>
            )}
          <h3>No Eligible Guests</h3>
          <p>
            No one in your party is currently eligible for this Lightning Lane.
          </p>
        </>
      )}
      <IneligibleGuestList />
    </>
  );
}
