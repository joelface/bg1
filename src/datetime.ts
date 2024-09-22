export function dateObject(dt: Date | number | string): Date {
  return typeof dt === 'string' && !dt.includes('T')
    ? new Date(dt + 'T00:00:00')
    : new Date(dt);
}

export class DateFormat {
  protected fmt;

  constructor(options: Intl.DateTimeFormatOptions) {
    this.fmt = Intl.DateTimeFormat('en-US', options);
  }

  format(date: Date | number | string) {
    return this.fmt.format(dateObject(date));
  }

  parts(date: Date | number | string): {
    [P in Intl.DateTimeFormatPartTypes]?: string;
  } {
    return Object.fromEntries(
      this.fmt.formatToParts(dateObject(date)).map(p => [p.type, p.value])
    );
  }
}

export class DateTime {
  readonly date;
  readonly time;

  protected static format: DateFormat;

  static setTimeZone(tz: string) {
    const d2 = '2-digit';
    DateTime.format = new DateFormat({
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: d2,
      day: d2,
      hour: d2,
      minute: d2,
      second: d2,
    });
  }

  constructor(date?: Date | number) {
    const dt = DateTime.format.parts(dateObject(date ?? Date.now()));
    this.date = `${dt.year}-${dt.month}-${dt.day}`;
    this.time = `${dt.hour}:${dt.minute}:${dt.second}`;
  }
}

DateTime.setTimeZone('America/New_York');

export function dateString(date: Date | number | string) {
  date = dateObject(date);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function modifyDate(date: Date | number | string, days: number) {
  date = dateObject(date);
  if (days) date.setDate(date.getDate() + days);
  return dateString(date);
}

export function parkDate(dateTime: Partial<DateTime> = {}): string {
  const now = new DateTime();
  const { date = now.date, time = now.time } = dateTime;
  return (time ?? '1') > '03:00:00' ? date : modifyDate(date, -1);
}

export type DisplayType = 'short';

export function displayDate(date: string, type?: DisplayType) {
  const dt = dateObject(date);
  const monthDay = dt.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
  });
  if (type === 'short') return monthDay;
  const today = parkDate();
  if (date === today) return `Today, ${monthDay}`;
  if (date === modifyDate(today, 1)) return `Tomorrow, ${monthDay}`;
  const weekday = dt.toLocaleString('en-US', { weekday: 'long' });
  return `${weekday}, ${monthDay}`;
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
export function splitDateTime(dateTime: string): DateTime {
  const [date, time] = dateTime.slice(0, 19).split('T');
  return { date, time };
}

/**
 * Converts time string to number of minutes since 7 AM
 */
export function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return ((h + 17) % 24) * 60 + m;
}

/**
 * Returns an array of non-past times from a sorted array of time strings
 */
export function upcomingTimes(times: string[]) {
  if (!Array.isArray(times)) return [];
  const now = new DateTime().time.slice(0, 5);
  const nextIdx = times.findIndex(t => t >= now);
  return nextIdx >= 0 ? times.slice(nextIdx) : [];
}
