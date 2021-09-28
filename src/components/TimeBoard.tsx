import { h } from 'preact';

import Clock from './Clock';
import { Queue } from '../virtual-queue';

const TIME_IS_IDS = {
  Orlando: 'Orlando_z161',
  Anaheim: 'Anaheim_z14e',
};

export default function TimeBoard({
  city,
  queue,
}: {
  city: keyof typeof TIME_IS_IDS;
  queue: Pick<Queue, 'nextScheduledOpenTime'>;
}): h.JSX.Element {
  return (
    <table className="mt-4 mx-auto text-gray-500">
      <Row
        heading="Next queue opening"
        time={<time>{queue.nextScheduledOpenTime || '--:--:--'}</time>}
      />
      <Row
        heading={
          <a
            href={`https://time.is/${city}`}
            id="time_is_link"
            target="_blank"
            rel="noreferrer"
          >
            Current time
          </a>
        }
        time={<Clock id={TIME_IS_IDS[city]} />}
      />
    </table>
  );
}

function Row({
  heading,
  time,
}: {
  heading: string | h.JSX.Element;
  time: h.JSX.Element;
}) {
  return (
    <tr>
      <th className="pr-3 text-right text-xs font-semibold uppercase">
        {heading}:
      </th>
      <td className="text-xl font-mono leading-tight">&#xfeff;{time}</td>
    </tr>
  );
}
