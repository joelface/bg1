import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';

import { sleep } from '../sleep';
import Flash, { useFlash } from './Flash';
import { Guest } from '../virtual-queue';
import FloatingButton from './FloatingButton';
import GuestList from './GuestList';

const JOIN_BTN_DISABLED_MIN_MS = 999;

export default function JoinQueue({
  guests,
  joinQueue,
  onEdit,
}: {
  guests: Guest[];
  joinQueue: () => Promise<boolean>;
  onEdit: () => void;
}): h.JSX.Element {
  const [joinDisabled, setJoinDisabled] = useState<boolean>(false);
  const [flashProps, flash] = useFlash();

  async function onJoinClick() {
    setJoinDisabled(true);
    flash('');
    const reenabled = sleep(JOIN_BTN_DISABLED_MIN_MS);
    try {
      if (!(await joinQueue())) flash('Queue not open yet');
    } catch (e) {
      flash('Error: try again', 'error');
      throw e;
    } finally {
      await reenabled;
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
      <Flash {...flashProps} />
    </>
  );
}
