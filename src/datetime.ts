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

export function parkDate(): string {
  const dt = dateTimeStrings();
  if (dt.time > '03:00:00') return dt.date;
  const parkDay = new Date();
  parkDay.setDate(parkDay.getDate() - 1);
  return dateTimeStrings(parkDay).date;
}

export function displayDate(date: string) {
  const dt = new Date(date + 'T00:00:00');
  const monthDay = dt.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
  });
  const today = dateTimeStrings().date;
  if (date === today) return `Today, ${monthDay}`;
  const tomorrowDT = new Date(today);
  tomorrowDT.setDate(tomorrowDT.getDate() + 1);
  const tomorrow = tomorrowDT.toISOString().split('T')[0];
  if (date === tomorrow) return `Tomorrow, ${monthDay}`;
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
export function splitDateTime(dateTime: string): DateTimeStrings {
  const [date, time] = dateTime.slice(0, 19).split('T');
  return { date, time };
}

/**
 * Converts time string to Date object
 */
export function timeToDate(time: string): Date {
  const dt = new Date();
  const [h, m, s] = time.split(':').map(Number);
  dt.setHours(h, m, s, 0);
  return dt;
}

/**
 * @returns Closest time from a list of times
 */
// const timeOptions = new Map<string, { text: string }>([
// ['07:00:00', { text: '7:00 AM' }],
// ['07:15:00', { text: '7:15 AM' }],
// ['07:30:00', { text: '7:30 AM' }],
// ['07:45:00', { text: '7:45 AM' }],
// ['08:00:00', { text: '8:00 AM' }],
// ['08:15:00', { text: '8:15 AM' }],
export function getClosestTime(
  times: Map<string, { text: string }>
): string {
  const now = timeToMinutes(dateTimeStrings().time);
  const options = [...times.keys()].map(time => ({
    time,
    minutes: timeToMinutes(time),
  }));
  const closest = options.reduce(
    (closest, option) =>
      // make sure time isn't in the past
      option.minutes > now &&
      Math.abs(option.minutes - now) < Math.abs(closest.minutes - now)
        ? option
        : closest,
    options[0]
  );
  return closest.time;
}

/**
 * Converts time string to number of minutes since 7 AM
 */
export function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return ((h + 17) % 24) * 60 + m;
}
