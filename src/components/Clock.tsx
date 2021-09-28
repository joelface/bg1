import { h } from 'preact';
import { useEffect } from 'preact/hooks';

import { dateTimeStrings } from '../datetime';
import * as timeIs from '../time-is';

function updateTime(id: string) {
  const elem = document.getElementById(id);
  if (!elem || elem.firstElementChild) return;
  elem.textContent = dateTimeStrings().time.slice(0, 8);
  setTimeout(() => updateTime(id), 100);
}

export default function Clock({ id }: { id: string }): h.JSX.Element {
  useEffect(() => {
    timeIs.add(id);
    updateTime(id);
  }, [id]);
  return <time id={id} />;
}
