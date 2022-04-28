import { h, Fragment } from 'preact';

import { displayTime } from '@/datetime';
import FloatingButton from '../FloatingButton';
import TimeBoard from '../TimeBoard';

export default function Prebooking({
  startTime,
  onRefresh,
}: {
  startTime?: string;
  onRefresh: () => void;
}): h.JSX.Element {
  return (
    <>
      {startTime && (
        <TimeBoard resort="WDW" time={startTime} label="Booking start" />
      )}
      <h3 className="mt-4">Not Available Yet</h3>
      {startTime ? (
        <p>
          At{' '}
          <time dateTime={startTime} className="font-semibold">
            {displayTime(startTime)}
          </time>
          , tap the <span className="font-semibold">Check Availability</span>{' '}
          button below to start booking this Lightning Lane.
        </p>
      ) : (
        <p>
          Sorry, but you can't make a Lightning Lane reservation for this
          attraction yet.
        </p>
      )}
      <FloatingButton onClick={onRefresh}>Check Availability</FloatingButton>
    </>
  );
}
