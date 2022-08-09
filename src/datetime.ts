let defaultTimeZone = 'America/New_York';

export function setDefaultTimeZone(timeZone: string): void {
  defaultTimeZone = timeZone;
}

/**
 * @returns Formatted date (YYYY-MM-DD) and time (HH:MM:SS) strings in the default time zone
 */
export function dateTimeStrings(date?: Date | number | string): {
  date: string;
  time: string;
} {
  date = new Date(date || Date.now());
  const dt: { [P in Intl.DateTimeFormatPartTypes]?: string } = {};
  const d2 = '2-digit';
  Intl.DateTimeFormat('en-US', {
    timeZone: defaultTimeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: d2,
    day: d2,
    hour: d2,
    minute: d2,
    second: d2,
  } as Intl.DateTimeFormatOptions)
    .formatToParts(date)
    .forEach(p => (dt[p.type] = p.value));
  return {
    date: `${dt.year}-${dt.month}-${dt.day}`,
    time: `${dt.hour}:${dt.minute}:${dt.second}`,
  };
}

export function displayTime(time: string) {
  const t = time.split(':').map(Number);
  const ampm = t[0] >= 12 ? 'PM' : 'AM';
  t[0] = t[0] % 12 || 12;
  return (
    t
      .map(v => String(v).padStart(2, '0'))
      .join(':')
      .replace(/(:\d+):00$/, '$1')
      .replace(/^0/, '') +
    ' ' +
    ampm
  );
}
