import { h, Fragment } from 'preact';

import { Guest, JoinQueueResult } from '../virtual-queue';
import FloatingButton from './FloatingButton';
import GuestList from './GuestList';

export default function BGResult({
  guests,
  result,
  onDone,
}: {
  guests: Guest[];
  result: JoinQueueResult;
  onDone: () => void;
}): h.JSX.Element {
  const { boardingGroup, conflicts } = result;
  const joinedGuests = guests.filter(g => !(g.guestId in conflicts));
  const failedGuests = guests.filter(g => g.guestId in conflicts);
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
      <FloatingButton onClick={onDone}>Done</FloatingButton>
    </>
  );
}
