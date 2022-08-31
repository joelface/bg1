import { DateTimeStrings, returnTime } from '@/datetime';

export default function ReturnTime(times: {
  start: Partial<DateTimeStrings>;
  end: Partial<DateTimeStrings>;
}) {
  return (
    <div className="mt-4 text-lg">
      Arrive by:{' '}
      <span className="ml-0.5 font-semibold">{returnTime(times)}</span>
    </div>
  );
}
