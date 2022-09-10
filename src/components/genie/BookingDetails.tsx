import { useState } from 'react';

import { Booking, EntitledGuest, Park } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import { usePark } from '@/contexts/Park';
import { useRebooking } from '@/contexts/Rebooking';
import { DEFAULT_THEME } from '@/contexts/Theme';
import Button from '../Button';
import FloatingButton from '../FloatingButton';
import GuestList from '../GuestList';
import Page from '../Page';
import ReturnTime from './ReturnTime';
import CancelGuests from './CancelGuests';

export default function BookingDetails({
  booking,
  onClose,
  isRebookable,
  isNew,
}: {
  booking: Booking;
  onClose: (newGuests: EntitledGuest[] | void) => void;
  isRebookable?: boolean;
  isNew?: boolean;
}) {
  const client = useGenieClient();
  const { name, park, choices, type } = booking;
  const isLL = type === 'LL';
  const currentPark = usePark() || park;
  const rebooking = useRebooking();
  const [guests, setGuests] = useState(isLL ? booking.guests : undefined);
  const [canceling, setCanceling] = useState(false);

  if (canceling && isLL && guests) {
    return (
      <CancelGuests
        booking={{ ...booking, guests }}
        onClose={newGuests => {
          setCanceling(false);
          if (newGuests.length > 0) {
            setGuests(newGuests);
          } else {
            onClose(newGuests);
          }
        }}
      />
    );
  }

  const choicesByPark = new Map([
    [currentPark, []],
    ...client.parks.map(
      park => [park, []] as [Park, Required<typeof booking>['choices']]
    ),
  ]);
  for (const exp of choices || []) choicesByPark.get(exp.park)?.push(exp);

  const parkChoices = [...choicesByPark.keys()];
  const theme = (
    !choices
      ? park
      : parkChoices.length === 1
      ? parkChoices[0]
      : { theme: DEFAULT_THEME }
  ).theme;

  return (
    <Page
      heading={isLL ? 'Your Lightning Lane' : 'Your Reservation'}
      theme={theme}
      buttons={
        isRebookable &&
        isLL && <Button onClick={() => rebooking.begin(booking)}>Rebook</Button>
      }
    >
      {choices ? (
        <h2>Multiple Experiences</h2>
      ) : (
        <>
          <h2>{name}</h2>
          <div>{park.name}</div>
        </>
      )}
      <ReturnTime {...booking} />
      {choices && (
        <>
          <p>
            <b>{name}</b> was temporarily unavailable during your return time.
            You may redeem this Lightning Lane at one of these replacement
            experiences:
          </p>
          {[...choicesByPark]
            .filter(([, choices]) => choices.length > 0)
            .map(([park, choices = []]) => (
              <div
                key={park.id}
                className={`mt-4 rounded ${park.theme?.bg || ''}`}
              >
                <h3 className="mt-0 p-1 text-white text-center">{park.name}</h3>
                <ul className="list-disc py-2 pl-8 bg-white bg-opacity-90">
                  {choices.map(exp => (
                    <li key={exp.id}>{exp.name}</li>
                  ))}
                </ul>
              </div>
            ))}
        </>
      )}
      <div className="flex mt-4">
        <h3 className="inline mt-0">Your Party</h3>
        {booking.cancellable && (
          <Button
            type="small"
            onClick={() => setCanceling(true)}
            className="ml-3"
          >
            Cancel
          </Button>
        )}
      </div>
      <GuestList
        guests={guests || booking.guests}
        conflicts={
          guests &&
          Object.fromEntries(
            guests
              .filter(g => g.redemptions !== undefined)
              .map(g => [g.id, `Redemptions left: ${g.redemptions}`])
          )
        }
      />
      <FloatingButton onClick={() => onClose(guests)}>
        {isNew ? 'Done' : 'Back'}
      </FloatingButton>
    </Page>
  );
}
