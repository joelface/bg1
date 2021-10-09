import { h } from 'preact';

import { Queue } from '../virtual-queue';

export default function QueueHeading({
  queue,
  queues,
  onChange,
}: {
  queue: Queue;
  queues?: Queue[];
  onChange?: (value: string) => void;
}): h.JSX.Element {
  queues ||= [];
  return (
    <h1 className="border-b-2 border-gray-200 text-xl font-semibold">
      {queues.length <= 1 ? (
        <span className="block w-full p-1 whitespace-nowrap overflow-hidden overflow-ellipsis">
          {queue.name}
        </span>
      ) : (
        <select
          className="block w-full border-none p-1 pr-7 bg-right bg-transparent text-xl font-semibold focus:ring-0"
          onChange={e => (onChange ? onChange(e.currentTarget.value) : null)}
        >
          {queues.map(q => (
            <option
              selected={q === queue}
              key={q.queueId}
              value={q.queueId}
              className="text-base font-normal"
            >
              {q.name}
            </option>
          ))}
        </select>
      )}
    </h1>
  );
}
