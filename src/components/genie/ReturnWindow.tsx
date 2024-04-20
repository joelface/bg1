import { Booking } from '@/api/genie';
import { parkDate } from '@/datetime';

import { Time } from '../Time';

export default function ReturnWindow({
  start,
  end,
}: Pick<Booking, 'start' | 'end'>) {
  const startParkDate = parkDate(start);
  const endParkDate = parkDate(end);

  if (!end) return <Time time={start.time} />;

  return (
    <>
      {start.time ? <Time time={start.time} /> : <span>Park Open</span>} –{' '}
      {endParkDate > startParkDate ? (
        <Time date={endParkDate} type="short" />
      ) : end.time ? (
        <Time time={end.time} />
      ) : (
        <span>Park Close</span>
      )}
    </>
  );
}
