import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';

import { Guest, Offer } from '@/api/genie';
import { useRebooking } from '@/contexts/Rebooking';
import Button from '../Button';
import FloatingButton from '../FloatingButton';
import GuestList from '../GuestList';
import ArrivalTimes from './ArrivalTimes';

export default function OfferDetails({
  offer,
  guests,
  ineligibleGuests,
  onConfirm,
}: {
  offer: Offer;
  guests: Guest[];
  ineligibleGuests: Guest[];
  onConfirm: (guests: Guest[]) => void;
}): h.JSX.Element | null {
  const rebooking = useRebooking();
  const [party, setParty] = useState(new Set(guests));
  const [editingParty, editParty] = useState(false);

  return (
    <>
      {rebooking.current && (
        <p className="border-2 rounded border-red-600 p-1 font-semibold text-center text-red-600 bg-red-100">
          Rebooking resets the two hour timer
        </p>
      )}
      <ArrivalTimes times={offer} />
      {offer.changeStatus === 'PARK_HOPPING' && (
        <div className="text-sm">
          <strong>Note:</strong> Time changed due to park hopping
        </div>
      )}
      {editingParty ? (
        <>
          <h3>Choose Your Party</h3>
          <GuestList
            guests={guests}
            selectable={{
              isSelected: g => party.has(g),
              onToggle: g => {
                const newParty = new Set(party);
                newParty[party.has(g) ? 'delete' : 'add'](g);
                setParty(newParty);
              },
            }}
          />
          {ineligibleGuests.length > 0 && (
            <>
              <h3>Ineligible Guests</h3>
              <GuestList
                guests={ineligibleGuests}
                conflicts={Object.fromEntries(
                  ineligibleGuests.map(g => [g.id, g.ineligibleReason])
                )}
                info={Object.fromEntries(
                  ineligibleGuests
                    .filter(g => !!g.displayEligibleAfter)
                    .map(g => [
                      g.id,
                      `Next eligible at ${g.displayEligibleAfter}`,
                    ])
                )}
              />
            </>
          )}
          <FloatingButton onClick={() => editParty(false)}>
            Confirm Party
          </FloatingButton>
        </>
      ) : (
        <>
          <div className="mt-4">
            <h3 className="inline mt-0">Your Party</h3>
            <span>
              <Button
                type="small"
                onClick={() => editParty(true)}
                className="ml-3"
              >
                Edit
              </Button>
            </span>
          </div>
          <GuestList guests={guests.filter(g => party.has(g))} />
          <FloatingButton onClick={() => onConfirm([...party])}>
            {rebooking.current ? 'Rebook' : 'Book'} Lightning Lane
          </FloatingButton>
        </>
      )}
    </>
  );
}
