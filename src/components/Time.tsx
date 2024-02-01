import { DisplayType, displayDate, displayTime } from '@/datetime';

export function Time({
  date,
  time,
  type,
  ...attrs
}: React.HTMLProps<HTMLTimeElement> & {
  date?: string;
  time?: string;
  type?: DisplayType;
}) {
  return (
    <time {...attrs} dateTime={date || time}>
      {date ? displayDate(date, type) : time ? displayTime(time) : ''}
    </time>
  );
}
