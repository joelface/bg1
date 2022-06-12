import { useEffect, useState } from 'react';

import { Guest, JoinQueueResult } from '/api/vq';
import FloatingButton from '../FloatingButton';
import GuestList from '../GuestList';

const DONE_BTN_HIDDEN_MS = {
  success: 5000,
  failure: 1000,
};

export default function BGResult({
  guests,
  result,
  onDone,
}: {
  guests: Guest[];
  result: JoinQueueResult;
  onDone: () => void;
}) {
  const { boardingGroup, conflicts } = result;
  const joinedGuests = guests.filter(g => !(g.id in conflicts));
  const failedGuests = guests.filter(g => g.id in conflicts);
  const [doneHidden, setDoneHidden] = useState(true);

  useEffect(() => {
    setTimeout(
      () => setDoneHidden(false),
      DONE_BTN_HIDDEN_MS[boardingGroup ? 'success' : 'failure']
    );
  }, [boardingGroup]);

  return (
    <>
      {boardingGroup ? (
        <>
          <h2 className="mt-5 text-xl">Boarding Group: {boardingGroup}</h2>
          <GuestList guests={joinedGuests} />

          {Object.keys(conflicts).length > 0 ? (
            <>
              <p className="font-semibold">These guests could not join:</p>
              <GuestList guests={failedGuests} conflicts={conflicts} />
            </>
          ) : null}

          <p>
            Refer to the My Disney Experience app for return time and other
            information.
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-5 text-xl">Sorry!</h2>
          <p>A boarding group could not be obtained.</p>
          <GuestList guests={failedGuests} conflicts={conflicts} />
        </>
      )}
      {doneHidden ? null : (
        <FloatingButton onClick={onDone}>Done</FloatingButton>
      )}
    </>
  );
}
