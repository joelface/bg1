import { displayDate, displayTime } from '@/datetime';

export function Time({
  date,
  time,
  ...attrs
}: React.HTMLProps<HTMLTimeElement> & { date?: string; time?: string }) {
  return (
    <time {...attrs} dateTime={date || time}>
      {date ? displayDate(date) : time ? displayTime(time) : ''}
    </time>
  );
}
