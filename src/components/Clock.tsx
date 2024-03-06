import { useEffect, useState } from 'react';

import { dateTimeStrings } from '@/datetime';
import { now, syncTime } from '@/timesync';

const CLOCK_UPDATE_MS = 50;

export default function Clock({
  onSync,
}: {
  onSync: (synced: boolean) => void;
}) {
  const [time, setTime] = useState(now());

  useEffect(() => {
    const intervalId = setInterval(() => setTime(now()), CLOCK_UPDATE_MS);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    syncTime()
      .then(() => onSync(true))
      .catch(() => onSync(false));
  }, [onSync]);

  return <time>{dateTimeStrings(time).time}</time>;
}
