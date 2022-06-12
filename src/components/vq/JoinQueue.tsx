import { useState } from 'react';

import { Guest, RequestError } from '/api/vq';
import useFlash from '/hooks/useFlash';
import { sleep } from '/sleep';
import FloatingButton from '../FloatingButton';
import GuestList from '../GuestList';
import Button from '../Button';

const JOIN_BTN_DISABLED_MIN_MS = 999;

export default function JoinQueue({
  guests,
  joinQueue,
  onEdit,
}: {
  guests: Guest[];
  joinQueue: () => Promise<boolean>;
  onEdit: () => void;
}) {
  const [joinDisabled, setJoinDisabled] = useState<boolean>(false);
  const [flashElem, flash] = useFlash();

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
        <h2 className="inline mr-3 text-xl">Your Party</h2>
        <Button type="small" onClick={onEdit}>
          Edit
        </Button>
      </div>
      <GuestList guests={guests} />
      <FloatingButton disabled={joinDisabled} onClick={onJoinClick}>
        Join Boarding Group
      </FloatingButton>
      {flashElem}
    </>
  );
}
