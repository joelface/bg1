import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';

import { Guest } from '../virtual-queue';
import FloatingButton from './FloatingButton';
import GuestList from './GuestList';

interface JoinQueueProps {
  guests: Guest[];
  onJoin: () => Promise<unknown>;
  onEdit: () => void;
}

export default function JoinQueue({
  guests,
  onJoin,
  onEdit,
}: JoinQueueProps): h.JSX.Element {
  const [joinDisabled, setJoinDisabled] = useState<boolean>(false);

  async function onJoinClick() {
    setJoinDisabled(true);
    try {
      await onJoin();
    } finally {
      setJoinDisabled(false);
    }
  }

  return (
    <>
      <div className="mt-5 text-xl">
        <h2 className="inline">Your Party</h2>
        <span>
          <button
            onClick={onEdit}
            className="ml-3 px-2 py-1.5 rounded-lg bg-blue-500 text-white text-xs uppercase font-semibold tracking-wide align-middle focus:outline-none focus:ring focus:ring-blue-600 focus:ring-offset-2"
          >
            Edit
          </button>
        </span>
      </div>
      <GuestList guests={guests} />
      <FloatingButton disabled={joinDisabled} onClick={onJoinClick}>
        Join Boarding Group
      </FloatingButton>
    </>
  );
}
