import { useParty } from '/contexts/Party';
import { displayTime } from '/datetime';
import GuestList from '../GuestList';

export default function IneligibleGuestList() {
  const { ineligible } = useParty();
  return (
    <GuestList
      guests={ineligible}
      conflicts={Object.fromEntries(
        ineligible.map(g => [
          g.id,
          g.eligibleAfter
            ? `TOO EARLY (${displayTime(g.eligibleAfter)})`
            : g.ineligibleReason || 'ELIGIBLE FOR NEW BOOKING',
        ])
      )}
    />
  );
}
