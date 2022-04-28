import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';

import { Guest, RequestError } from '@/api/vq';
import { useTheme } from '@/contexts/Theme';
import useFlash from '@/hooks/useFlash';
import { sleep } from '@/sleep';
import FloatingButton from '../FloatingButton';
import GuestList from '../GuestList';

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
  const [flashElem, flash] = useFlash();
  const { bg } = useTheme();

  async function onJoinClick() {
    setJoinDisabled(true);
    flash('');
    const reenabled = sleep(JOIN_BTN_DISABLED_MIN_MS);
    try {
      if (!(await joinQueue())) flash('Queue not open yet');
    } catch (error) {
      flash('Error: try again', 'error');
      if (!(error instanceof RequestError)) console.error(error);
    } finally {
      await reenabled;
      setJoinDisabled(false);
    }
  }

  return (
    <>
      <div className="mt-4">
        <h2 className="inline text-xl">Your Party</h2>
        <span>
          <button
            onClick={onEdit}
            className={`ml-3 px-2 py-1.5 rounded-lg ${bg} text-white text-xs uppercase font-semibold tracking-wide align-middle`}
          >
            Edit
          </button>
        </span>
      </div>
      <GuestList guests={guests} />
      <FloatingButton disabled={joinDisabled} onClick={onJoinClick}>
        Join Boarding Group
      </FloatingButton>
      {flashElem}
    </>
  );
}
