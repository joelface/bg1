import { Queue } from '/api/vq';
import { useTheme } from '/contexts/Theme';

export default function QueueHeading({
  queue,
  queues,
  onChange,
}: {
  queue: Queue;
  queues?: Queue[];
  onChange?: (value: string) => void;
}) {
  queues ||= [];
  const { bg } = useTheme();
  const className = `block w-full ${bg} text-white text-xl font-semibold`;
  return (
    <>
      {queues.length <= 1 ? (
        <span className={`${className} px-1 truncate`}>{queue.name}</span>
      ) : (
        <select
          className={`${className} pr-1`}
          value={queue.id}
          onChange={e => (onChange ? onChange(e.currentTarget.value) : null)}
        >
          {queues.map(q => (
            <option key={q.id} value={q.id} className="text-base font-normal">
              {q.name}
            </option>
          ))}
        </select>
      )}
    </>
  );
}
