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
      end: endParkDate > today ? undefined : end?.time,
    };
    timeElem = (
      <>
        {rt.start ? <Time time={rt.start} /> : <span>Park Open</span>} –{' '}
        {rt.end ? <Time time={rt.end} /> : <span>Park Close</span>}
      </>
    );
  } else {
    timeElem = <Time time={start.time} />;
  }
  if (timeOnly) return timeElem;
  return (
    <table className="mt-4 text-lg">
      <tbody>
        <Row label={end ? 'Arrive by' : 'Reservation at'} data={timeElem} />
        {end && endParkDate !== startParkDate && endParkDate !== today && (
          <Row label="Valid until" data={<Time date={endParkDate} />} />
        )}
      </tbody>
    </table>
  );
}

function Row({ label, data }: { label: string; data: React.ReactNode }) {
  return (
    <tr>
      <th className="text-right">{label}:</th>
      <td className="pl-2 font-semibold">{data}</td>
    </tr>
  );
}
