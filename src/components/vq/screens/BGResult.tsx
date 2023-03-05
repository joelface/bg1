import { useEffect, useState } from 'react';

import { Guest, JoinQueueResult, Queue } from '@/api/vq';
import FloatingButton from '@/components/FloatingButton';
import GuestList from '@/components/GuestList';
import Screen from '@/components/Screen';
import { useNav } from '@/contexts/Nav';

import SelectQueue from './SelectQueue';

const DONE_BTN_HIDDEN_MS = 5_000;

export default function BGResult({
  queue,
  guests,
  result,
}: {
  queue: Queue;
  guests: Guest[];
  result: JoinQueueResult;
}) {
  const { boardingGroup, conflicts } = result;
  const hasBG = boardingGroup !== null;
  const joinedGuests = guests.filter(g => !(g.id in conflicts));
  const failedGuests = guests.filter(g => g.id in conflicts);
  const { goBack } = useNav();
  const [doneShown, setDoneShown] = useState(false);

  useEffect(() => {
    if (hasBG) setTimeout(() => setDoneShown(true), DONE_BTN_HIDDEN_MS);
  }, [hasBG]);

  return (
    <Screen heading="Boarding Group">
      <h2>{queue.name}</h2>
      {hasBG ? (
        <>
          <h3>Congratulations! 🎉</h3>
          <p>You joined the virtual queue!</p>
          <p className="text-lg font-semibold">
            Boarding Group: {boardingGroup}
          </p>
          <GuestList guests={joinedGuests} />

          {Object.keys(conflicts).length > 0 && (
            <>
              <p className="font-semibold">These guests could not join:</p>
              <GuestList guests={failedGuests} conflicts={conflicts} />
            </>
          )}

          <p>
            Refer to the My Disney Experience app for return time and other
            information.
          </p>
          {doneShown && (
            <FloatingButton onClick={() => goBack({ screen: SelectQueue })}>
              Done
            </FloatingButton>
          )}
        </>
      ) : (
        <>
          <h3>Sorry!</h3>
          <p>A boarding group could not be obtained. Go back and try again.</p>
          <GuestList guests={failedGuests} conflicts={conflicts} />
        </>
      )}
    </Screen>
  );
}
