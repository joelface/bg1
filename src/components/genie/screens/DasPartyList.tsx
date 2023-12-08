import { useLayoutEffect } from 'react';

import { DasParty } from '@/api/das';
import { DasBooking } from '@/api/genie';
import Button from '@/components/Button';
import Screen from '@/components/Screen';
import { Time } from '@/components/Time';
import { useNav } from '@/contexts/Nav';
import { usePark } from '@/contexts/Park';
import { usePlans } from '@/contexts/Plans';

import BookingDetails from './BookingDetails';
import DasSelection from './DasSelection';

export default function DasPartyList({ parties }: { parties: DasParty[] }) {
  const { goTo } = useNav();
  const { park } = usePark();
  const { plans, refreshPlans, loaderElem } = usePlans();

  useLayoutEffect(refreshPlans, [refreshPlans]);

  const dasGuestIds = new Set(parties.map(p => p[0]).map(g => g.id));
  const selections = plans.filter(
    (b): b is DasBooking => b.type === 'DAS' && b.subtype === 'IN_PARK'
  );
  const selectionByGuestId = new Map(
    selections
      .filter(
        (b): b is DasBooking => b.type === 'DAS' && b.subtype === 'IN_PARK'
      )
      .map(b => [b.guests.find(g => dasGuestIds.has(g.id))?.id ?? '', b])
  );

  if (!loaderElem && parties.length === 1) {
    const party = parties[0];
    const selection = selectionByGuestId.get(party[0].id);
    if (selection) {
      return <BookingDetails booking={selection} />;
    } else {
      return <DasSelection park={park} party={party} />;
    }
  }

  const unbookedParties = parties.filter(
    p => !selectionByGuestId?.has(p[0].id)
  );
  const bookedParties = parties.filter(p => selectionByGuestId?.has(p[0].id));

  return (
    <Screen
      heading={`DAS ${parties.length === 1 ? 'Selection' : 'Parties'}`}
      theme={park.theme}
    >
      {loaderElem ? (
        loaderElem
      ) : parties.length > 0 ? (
        <>
          {unbookedParties.length > 0 && (
            <>
              <h3>Select Next Experience</h3>
              <ul className="mt-2">
                {unbookedParties.map(p => (
                  <li
                    key={p[0].id}
                    className="flex items-center gap-x-3 pl-3 py-1"
                  >
                    <span
                      className="flex-shrink-0 w-[48px] h-[48px] leading-[48px] rounded-full text-3xl font-bold text-center bg-gray-400 text-white"
                      aria-hidden="true"
                    >
                      {p[0].avatarImageUrl ? (
                        <img
                          src={p[0].avatarImageUrl}
                          alt=""
                          width="48"
                          height="48"
                          className="rounded-full"
                        />
                      ) : (
                        p[0].name[0]
                      )}
                    </span>
                    <span className="flex-1 leading-tight">{p[0].name}</span>
                    <Button
                      type="small"
                      onClick={() =>
                        goTo(<DasSelection park={park} party={p} />)
                      }
                    >
                      Select
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {bookedParties.length > 0 && (
            <>
              <h3>Current Selection</h3>
              <ul className="mt-2">
                {bookedParties.map(p => {
                  const selection = selectionByGuestId.get(p[0].id);
                  return (
                    <li
                      key={p[0].id}
                      className="flex items-center gap-x-3 pl-3 py-1"
                    >
                      <span
                        className="flex-shrink-0 w-[48px] h-[48px] leading-[48px] rounded-full text-3xl font-bold text-center bg-gray-400 text-white"
                        aria-hidden="true"
                      >
                        {p[0].avatarImageUrl ? (
                          <img
                            src={p[0].avatarImageUrl}
                            alt=""
                            width="48"
                            height="48"
                            className="rounded-full"
                          />
                        ) : (
                          p[0].name[0]
                        )}
                      </span>
                      <div className="flex-1">
                        <div>{p[0].name}</div>
                        {selection && (
                          <div className="text-gray-500 text-xs font-semibold uppercase">
                            {selection.name} @{' '}
                            <Time time={selection.start.time} />
                          </div>
                        )}
                      </div>
                      <Button
                        type="small"
                        onClick={() => {
                          if (!selection) return;
                          goTo(<BookingDetails booking={selection} />);
                        }}
                      >
                        Details
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </>
      ) : (
        <div />
      )}
    </Screen>
  );
}
