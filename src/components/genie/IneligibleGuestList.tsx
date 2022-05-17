import { h } from 'preact';

import { Guest } from '@/api/genie';
import { displayTime } from '@/datetime';
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
          g.eligibleAfter
            ? `TOO EARLY (${displayTime(g.eligibleAfter)})`
            : g.ineligibleReason,
        ])
      )}
    />
  );
}
