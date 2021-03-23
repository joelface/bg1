import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { dateTimeStrings } from '../datetime';

function now() {
  return dateTimeStrings().time.slice(0, 8);
}

export default function Clock(): h.JSX.Element {
  const [time, setTime] = useState(now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(now());
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return <time>{time}</time>;
}
