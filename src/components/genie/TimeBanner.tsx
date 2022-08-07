import { useEffect, useState } from 'react';

import { useGenieClient } from '@/contexts/GenieClient';
import { useTheme } from '@/contexts/Theme';
import { dateTimeStrings, displayTime } from '@/datetime';

const MIN_UPDATE_INTERVAL = 60_000;

export default function TimeBanner({
  startTime,
  dropTime,
  update,
}: {
  startTime?: string;
  dropTime?: string;
  update?: boolean;
}) {
  const client = useGenieClient();
  const theme = useTheme();
  const [bookTime, setBookTime] = useState<string | undefined>();
  const [, setLastUpdated] = useState(0);

  useEffect(() => {
    if (startTime) {
      setBookTime(startTime);
      return;
    }
    if (!update) return;
    setLastUpdated(lastUpdated => {
      const now = Date.now();
      if (now - lastUpdated < MIN_UPDATE_INTERVAL) {
        return lastUpdated;
      }
      client.nextBookTime().then(setBookTime);
      return now;
    });
  }, [client, startTime, update]);

  if (!bookTime && !dropTime) return null;
  return (
    <div
      className={`flex justify-center gap-x-10 -mx-3 px-3 pb-1 ${theme.bg} text-white text-sm font-semibold uppercase text-center`}
    >
      <LabeledTime label="Book" time={bookTime} />
      <LabeledTime label="Drop" time={dropTime} />
    </div>
  );
}

function LabeledTime({ label, time }: { label?: string; time?: string }) {
  if (!time) return null;
  time = time.slice(0, 5);
  const now = dateTimeStrings().time.slice(0, 5);
  return (
    <div>
      {label}:{' '}
      <time dateTime={time} className="whitespace-nowrap">
        {time > now ? displayTime(time) : 'now'}
      </time>
    </div>
  );
}
