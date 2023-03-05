import Notice from '@/components/Notice';
import { useGenieClient } from '@/contexts/GenieClient';
import { useRebooking } from '@/contexts/Rebooking';
import { displayTime } from '@/datetime';

import IneligibleGuestList from '../../IneligibleGuestList';

export default function NoEligibleGuests() {
  const client = useGenieClient();
  const rebooking = useRebooking();
  return (
    <>
      {client.nextBookTime && (
        <Notice>Eligible at {displayTime(client.nextBookTime)}</Notice>
      )}
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
