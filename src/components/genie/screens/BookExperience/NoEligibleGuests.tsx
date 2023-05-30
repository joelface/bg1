import Notice from '@/components/Notice';
import { Time } from '@/components/Time';
import { useGenieClient } from '@/contexts/GenieClient';
import { useRebooking } from '@/contexts/Rebooking';
import { dateTimeStrings } from '@/datetime';

import IneligibleGuestList from '../../IneligibleGuestList';

export default function NoEligibleGuests() {
  const client = useGenieClient();
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
          {client.nextBookTime &&
            client.nextBookTime.slice(0, 5) >
              dateTimeStrings().time.slice(0, 5) && (
              <Notice>
                Eligible at <Time time={client.nextBookTime} />
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
