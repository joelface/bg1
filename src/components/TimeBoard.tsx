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
      <Row heading="Current time" time={<Clock />} />
    </table>
  );
}

function Row({ heading, time }: { heading: string; time: h.JSX.Element }) {
  return (
    <tr>
      <th className="pr-3 text-right text-xs font-semibold uppercase">
        {heading}:
      </th>
      <td className="text-xl font-mono leading-tight">{time}</td>
    </tr>
  );
}
