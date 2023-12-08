import { Booking } from '@/api/genie';
import { DateTimeStrings, dateTimeStrings } from '@/datetime';

import { Time } from '../Time';

export default function ReturnTime({
  start,
  end,
  timeOnly,
}: Pick<Booking, 'start' | 'end'> & { timeOnly?: boolean }) {
  const rt = returnTime({ start, end });
  const timeElem = !end ? (
    <Time time={start.time} />
  ) : (
    <>
      {rt.start ? <Time time={rt.start} /> : <span>Park Open</span>} –{' '}
      {rt.end ? <Time time={rt.end} /> : <span>Park Close</span>}
    </>
  );
  if (timeOnly) return timeElem;
  const today = dateTimeStrings().date;
  return (
    <table className="mt-4 text-lg">
      <tbody>
        <Row label={end ? 'Arrive by' : 'Reservation at'} data={timeElem} />
        {end?.date && end.date > (start.date ?? today) && (
          <Row label="Valid until" data={<Time date={end.date} />} />
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

interface BookingDateTimes {
  start: Partial<DateTimeStrings>;
  end?: Partial<DateTimeStrings>;
}

export function returnTime({ start, end }: BookingDateTimes): {
  start?: string;
  end?: string;
} {
  const today = dateTimeStrings().date;
  return {
    start: (start.date || '') < today ? undefined : start.time,
    end: end?.time,
  };
}
