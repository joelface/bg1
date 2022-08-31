export interface DateTimeStrings {
  date: string;
  time: string;
}

let defaultTimeZone = 'America/New_York';

export function setDefaultTimeZone(timeZone: string): void {
  defaultTimeZone = timeZone;
}

/**
 * @returns Formatted date (YYYY-MM-DD) and time (HH:MM:SS) strings in the default time zone
 */
export function dateTimeStrings(date?: Date | number): DateTimeStrings {
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
  const t = time.split(':').slice(0, 2).map(Number);
  const ampm = t[0] >= 12 ? 'PM' : 'AM';
  t[0] = t[0] % 12 || 12;
  return (
    t
      .map(v => String(v).padStart(2, '0'))
      .join(':')
      .replace(/^0/, '') +
    ' ' +
    ampm
  );
}

/**
 * Splits ISO 8601 date/time string (YYYY-MM-DDTHH:mm:ss) into separate parts
 */
export function splitDateTime(dateTime: string): Partial<DateTimeStrings> {
  const [date, time] = dateTime.slice(0, 19).split('T');
  return { date, time };
}

export function returnTime({
  start,
  end,
}: {
  start: Partial<DateTimeStrings>;
  end: Partial<DateTimeStrings>;
}): string {
  const open = returnTimeValue(start, 'Park Open');
  const close = returnTimeValue(end, 'Park Close');
  return `${open} - ${close}`;
}

function returnTimeValue(
  { date, time }: Partial<DateTimeStrings>,
  noTimeText: string
) {
  const now = dateTimeStrings();
  if (date && date !== now.date) {
    return new Date(date + 'T00:00').toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year:
        date.split('-')[0] === now.date.split('-')[0] ? undefined : 'numeric',
    });
  }
  return time ? displayTime(time) : noTimeText;
}
