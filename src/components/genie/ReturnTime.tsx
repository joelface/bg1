import { Booking } from '@/api/genie';
import { parkDate } from '@/datetime';

import { Time } from '../Time';

export default function ReturnTime({
  start,
  end,
  timeOnly,
}: Pick<Booking, 'start' | 'end'> & { timeOnly?: boolean }) {
  const today = parkDate();
  const startParkDate = parkDate(start);
  const endParkDate = parkDate(end);
  let timeElem: JSX.Element;
  if (end) {
    const rt = {
      start: startParkDate < today ? undefined : start.time,
      end: end?.time,
    };
    timeElem = (
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
  } else {
    timeElem = <Time time={start.time} />;
  }
  if (timeOnly) return timeElem;
  return (
    <div className="mt-4 text-lg">
      {end ? 'Arrive by' : 'Reservation at'}:{' '}
      <span className="pl-1 font-semibold">{timeElem}</span>
    </div>
  );
}
