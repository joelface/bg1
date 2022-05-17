import { h, Fragment } from 'preact';

import { useParty } from '@/contexts/Party';
import { displayTime } from '@/datetime';
import FloatingButton from '../FloatingButton';
import IneligibleGuestList from './IneligibleGuestList';

export default function NoEligibleGuests({
  onClose,
}: {
  onClose: () => void;
}): h.JSX.Element {
  const { ineligible } = useParty();
  const { eligibleAfter } = ineligible[0] || {};
  return (
    <>
      {eligibleAfter && (
        <div className="mt-4 border-2 border-green-600 rounded p-1 uppercase font-semibold text-center text-green-600 bg-green-100">
          Eligible at {displayTime(eligibleAfter)}
        </div>
      )}
      <h3 className="mt-4">No Eligible Guests</h3>
      <p>No one in your party is currently eligible for this Lightning Lane.</p>
      <IneligibleGuestList />
      <FloatingButton onClick={onClose}>Back</FloatingButton>
    </>
  );
}
