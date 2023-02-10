import { useState } from 'react';

import { Booking, EntitledGuest, Park } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import { useRebooking } from '@/contexts/Rebooking';
import { DEFAULT_THEME } from '@/contexts/Theme';
import Button from '@/components/Button';
import FloatingButton from '@/components/FloatingButton';
import GuestList from '@/components/GuestList';
import Screen from '@/components/Screen';
import ReturnTime from '../ReturnTime';
import CancelGuests from './CancelGuests';
import { ExperienceList } from '../ExperienceList';

export default function BookingDetails({
  booking,
  onClose,
  isNew,
}: {
  booking: Booking;
  onClose: (newGuests: EntitledGuest[] | void) => void;
  isNew?: boolean;
}) {
  const client = useGenieClient();
  const { name, park, choices, type } = booking;
  const isLL = type === 'LL';
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
    [park, []],
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
    <Screen
      heading={
        'Your ' +
        (isLL
          ? booking.subtype === 'DAS'
            ? 'DAS Return Time'
            : 'Lightning Lane'
          : 'Reservation')
      }
      theme={theme}
      buttons={
        booking.modifiable && (
          <Button onClick={() => rebooking.begin(booking)}>Modify</Button>
        )
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
              <ExperienceList
                heading={park.name}
                experiences={choices}
                bg={park.theme?.bg ?? ''}
                key={park.id}
              />
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
              .filter(g => (g.redemptions ?? 1) !== 1)
              .map(g => [g.id, `Redemptions left: ${g.redemptions}`])
          )
        }
      />
      <FloatingButton onClick={() => onClose(guests)}>
        {isNew ? 'Done' : 'Back'}
      </FloatingButton>
    </Screen>
  );
}
