import { useTheme } from '@/contexts/Theme';
import { DateTime, displayTime } from '@/datetime';

export default function TimeBanner({
  bookTime,
  dropTime,
}: {
  bookTime?: string;
  dropTime?: string;
}) {
  const theme = useTheme();

  if (!bookTime && !dropTime) return null;
  return (
    <div className={`flex justify-center gap-x-10 ${theme.bg}`}>
      <LabeledTime label="Book" time={bookTime} />
      <LabeledTime label="Drop" time={dropTime} />
    </div>
  );
}

function LabeledTime({ label, time }: { label?: string; time?: string }) {
  if (!time) return null;
  time = time.slice(0, 5);
  const now = new DateTime().time.slice(0, 5);
  return (
    <div>
      {label}:{' '}
      <time dateTime={time} className="whitespace-nowrap">
        {time > now ? displayTime(time) : 'now'}
      </time>
    </div>
  );
}
