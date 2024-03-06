import FloatingButton from '@/components/FloatingButton';
import TimeBoard from '@/components/TimeBoard';
import { displayTime } from '@/datetime';

import PartyList from './PartyList';

export default function Prebooking({
  startTime,
  onRefresh,
}: {
  startTime?: string;
  onRefresh: () => void;
}) {
  return (
    <>
      {startTime ? (
        <>
          <TimeBoard time={startTime} label="Booking start" />
          <p>
            At{' '}
            <time dateTime={startTime} className="font-semibold">
              {displayTime(startTime)}
            </time>
            , tap the <span className="font-semibold">Check Availability</span>{' '}
            button below to start booking this Lightning Lane.
          </p>
        </>
      ) : (
        <p>
          Sorry, but you can't make a Lightning Lane reservation for this
          attraction yet.
        </p>
      )}
      <PartyList
        button={
          <FloatingButton onClick={onRefresh}>
            Check Availability
          </FloatingButton>
        }
      />
    </>
  );
}
