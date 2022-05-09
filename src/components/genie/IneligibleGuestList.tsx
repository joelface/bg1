import { h } from 'preact';

import { Guest } from '@/api/genie';
import GuestList from '../GuestList';

export default function IneligibleGuestList({
  guests,
}: {
  guests: Guest[];
}): h.JSX.Element {
  return (
    <GuestList
      guests={guests}
      conflicts={Object.fromEntries(
        guests.map(g => [
          g.id,
          g.displayEligibleAfter
            ? `TOO EARLY (${g.displayEligibleAfter})`
            : g.ineligibleReason,
        ])
      )}
    />
  );
}
