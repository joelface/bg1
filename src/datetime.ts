let defaultTimeZone = 'America/New_York';

export function setDefaultTimeZone(timeZone: string): void {
  defaultTimeZone = timeZone;
}

/**
 * @returns Formatted date (YYYY-MM-DD) and time (HH:MM:SS.sss) strings in the default time zone
 */
export function dateTimeStrings(date?: Date): { date: string; time: string } {
  date = date || new Date(Date.now());
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
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return {
    date: `${dt.year}-${dt.month}-${dt.day}`,
    time: `${dt.hour}:${dt.minute}:${dt.second}.${ms}`,
  };
}
