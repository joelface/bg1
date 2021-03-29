import { h, Fragment } from 'preact';

import { Queue } from '../virtual-queue';

export default function QueueSelector({
  queues,
  selected,
  onChange,
}: {
  queues: Queue[];
  selected: Queue;
  onChange: (value: string) => void;
}): h.JSX.Element {
  return (
    <>
      {queues.length === 1 ? (
        <span className="inline-block p-1 text-xl font-semibold">
          {selected.name}
        </span>
      ) : (
        <select
          className="w-full border-none p-1 bg-transparent text-xl font-semibold focus:ring-0"
          onChange={e => onChange(e.currentTarget.value)}
        >
          {queues.map(q => (
            <option
              selected={q === selected}
              key={q.queueId}
              value={q.queueId}
              className="text-base font-normal"
            >
              {q.name}
            </option>
          ))}
        </select>
      )}
    </>
  );
}
