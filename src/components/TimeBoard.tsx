import { h } from 'preact';

import Clock from './Clock';
import { Queue } from '../virtual-queue';

interface TimeBoardProps {
  queue: Queue;
}

export default function TimeBoard({ queue }: TimeBoardProps): h.JSX.Element {
  return (
    <table className="mt-4 mx-auto text-gray-500">
      <tr>
        <th className="pr-3 text-right text-xs font-semibold uppercase">
          Next queue opening:
        </th>
        <td className="text-xl font-mono leading-tight">
          <time>{queue.nextScheduledOpenTime || '07:00:00'}</time>
        </td>
      </tr>
      <tr>
        <th className="pr-3 text-right text-xs font-semibold uppercase">
          Current time:
        </th>
        <td className="text-xl font-mono leading-tight">
          <Clock />
        </td>
      </tr>
    </table>
  );
}
