import { h, Fragment } from 'preact';

import { Guest } from '@/api/genie';
import FloatingButton from '../FloatingButton';
import IneligibleGuestList from './IneligibleGuestList';

export default function NoEligibleGuests({
  guests,
  onClose,
}: {
  guests: Guest[];
  onClose: () => void;
}): h.JSX.Element {
  const eligibleAfter = guests?.[0]?.displayEligibleAfter;
  return (
    <>
      {eligibleAfter && (
        <div className="mt-4 border-2 border-green-600 rounded p-1 uppercase font-semibold text-center text-green-600 bg-green-100">
          Eligible at {eligibleAfter}
        </div>
      )}
      <h3 className="mt-4">No Eligible Guests</h3>
      <p>No one in your party is currently eligible for this Lightning Lane.</p>
      <IneligibleGuestList guests={guests} />
      <FloatingButton onClick={onClose}>Back</FloatingButton>
    </>
  );
}
