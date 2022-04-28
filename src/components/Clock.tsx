import { h } from 'preact';
import { useEffect } from 'preact/hooks';

import { dateTimeStrings } from '@/datetime';
import * as timeIs from '@/time-is';

function updateTime(id: string, onSync: () => void) {
  const elem = document.getElementById(id);
  if (!elem || elem.firstElementChild) return onSync();
  elem.textContent = dateTimeStrings().time;
  setTimeout(() => updateTime(id, onSync), 100);
}

export default function Clock({
  id,
  onSync,
}: {
  id: string;
  onSync: () => void;
}): h.JSX.Element {
  useEffect(() => {
    timeIs.add(id);
    updateTime(id, onSync);
  }, [id, onSync]);
  return <time id={id} />;
}
