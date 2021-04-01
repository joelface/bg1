import { h } from 'preact';

import Clock from './Clock';
import { Queue } from '../virtual-queue';

export default function TimeBoard({
  queue,
}: {
  queue: Pick<Queue, 'nextScheduledOpenTime'>;
}): h.JSX.Element {
  return (
    <table className="mt-4 mx-auto text-gray-500">
      <Row
        heading="Next queue opening"
        time={<time>{queue.nextScheduledOpenTime || '07:00:00'}</time>}
      />
      <Row
        heading={
          <a
            href="https://time.is/Orlando"
            id="time_is_link"
            target="_blank"
            rel="noreferrer"
          >
            Current time
          </a>
        }
        time={<Clock />}
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
