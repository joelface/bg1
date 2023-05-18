import { useState } from 'react';

import { Park } from '@/api/data';
import { Booking } from '@/api/genie';
import Button from '@/components/Button';
import FloatingButton from '@/components/FloatingButton';
import GuestList from '@/components/GuestList';
import Notice from '@/components/Notice';
import Screen from '@/components/Screen';
import { Time } from '@/components/Time';
import { useNav } from '@/contexts/Nav';
import { usePark } from '@/contexts/Park';
import { useRebooking } from '@/contexts/Rebooking';
import { useResortData } from '@/contexts/ResortData';
import { DEFAULT_THEME } from '@/contexts/Theme';

import { ExperienceList } from '../ExperienceList';
import ReturnTime from '../ReturnTime';
import CancelGuests from './CancelGuests';
import Home from './Home';

export default function BookingDetails({
  booking,
  isNew,
}: {
  booking: Booking;
  isNew?: boolean;
}) {
  const { goTo, goBack } = useNav();
  const { setPark } = usePark();
  const { parks } = useResortData();
  const { name, park, choices, type, start } = booking;
  const isLL = type === 'LL';
  const isBG = type === 'BG';
  const rebooking = useRebooking();
  const [guests, setGuests] = useState(isLL ? booking.guests : undefined);

  const choicesByPark = new Map([
    [park as Park, []],
    ...[...parks.values()].map(
      park => [park, []] as [Park, Required<typeof booking>['choices']]
    ),
  ]);
  for (const exp of choices || []) choicesByPark.get(exp.park)?.push(exp);

  const parkChoices = [...choicesByPark]
    .filter(([, exps]) => exps.length > 0)
    .map(([park]) => park);
  const theme =
    (!choices ? park : parkChoices.length === 1 ? parkChoices[0] : {}).theme ??
    DEFAULT_THEME;

  return (
    <Screen
      heading={
        'Your ' +
        (isLL
          ? booking.subtype === 'DAS'
            ? 'DAS Return Time'
            : 'Lightning Lane'
          : isBG
          ? 'Boarding Group'
          : 'Reservation')
      }
      theme={theme}
      buttons={
        booking.modifiable && (
          <Button
            onClick={() => {
              rebooking.begin(booking);
              setPark(booking.park);
              goBack({ screen: Home, props: { tabName: 'Genie+' } });
            }}
          >
            Modify
          </Button>
        )
      }
    >
      {
        <div
          className={`-mx-3 px-2 py-1 text-center ${theme.bg} text-white text-sm font-semibold uppercase`}
        >
          <Time date={start.date} />
        </div>
      }
      {choices ? (
        <h2>Multiple Experiences</h2>
      ) : (
        <>
          <h2>{name}</h2>
          <div>{park.name}</div>
        </>
      )}
      {isBG ? (
        <>
          {booking.status === 'SUMMONED' && (
            <Notice>Your boarding group has been called</Notice>
          )}
          <h3>
            Boarding Group:{' '}
            <span className="ml-1 font-semibold">{booking.boardingGroup}</span>
          </h3>
          <p>
            Check the official Disney app for return time and other virtual
            queue information.
          </p>
        </>
      ) : (
        <ReturnTime {...booking} />
      )}
      {choices && (
        <>
          <p>
            <b>{name}</b> was temporarily unavailable during your return time.
            You may redeem this Lightning Lane at one of these replacement
            experiences:
          </p>
          {[...choicesByPark]
            .filter(([, choices]) => choices.length > 0)
            .map(([park, choices]) => (
              <ExperienceList
                heading={park.name}
                experiences={choices}
                bg={park.theme.bg}
                key={park.id}
              />
            ))}
        </>
      )}
      <div className="flex mt-4">
        <h3 className="inline mt-0">Your Party</h3>
        {booking.cancellable && guests && (
          <Button
            type="small"
            onClick={() => {
              goTo(
                <CancelGuests
                  booking={{ ...booking, guests }}
                  onCancel={remainingGuests => {
                    if (remainingGuests.length > 0) {
                      setGuests(remainingGuests);
                    } else {
                      goBack();
                    }
                  }}
                />
              );
            }}
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
      {isNew && (
        <FloatingButton
          onClick={() => goBack({ screen: Home, props: { tabName: 'Plans' } })}
        >
          Show Plans
        </FloatingButton>
      )}
    </Screen>
  );
}
