import { Booking } from '@/api/genie';
import { parkDate } from '@/datetime';

import { Time } from '../Time';

export default function ReturnWindow({
  start,
  end,
}: Pick<Booking, 'start' | 'end'>) {
  const today = parkDate();
  const startParkDate = parkDate(start);
  const endParkDate = parkDate(end);

  if (!end) return <Time time={start.time} />;

  const rt = {
    start: startParkDate < today ? undefined : start.time,
    end: end?.time,
  };
  return (
    <>
      {rt.start ? <Time time={rt.start} /> : <span>Park Open</span>} –{' '}
      {rt.end ? (
        endParkDate === startParkDate || endParkDate === today ? (
          <Time time={rt.end} />
        ) : (
          <Time date={endParkDate} type="short" />
        )
      ) : (
        <span>Park Close</span>
      )}
    </>
  );
}
