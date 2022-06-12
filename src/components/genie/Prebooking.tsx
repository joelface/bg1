import { displayTime } from '/datetime';
import TimeBoard from '../TimeBoard';
import YourParty from './YourParty';

export default function Prebooking({
  startTime,
  onRefresh,
}: {
  startTime?: string;
  onRefresh: () => void;
}) {
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
      <YourParty buttonText="Check Availability" onSubmit={onRefresh} />
    </>
  );
}
