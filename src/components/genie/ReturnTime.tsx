import { DateTimeStrings, returnTime } from '@/datetime';

export default function ReturnTime(
  times:
    | { start: Partial<DateTimeStrings>; end: Partial<DateTimeStrings> }
    | { start: DateTimeStrings; end: undefined }
) {
  return (
    <div className="mt-4 text-lg">
      {times.end ? 'Arrive by' : 'Reservation at'}:{' '}
      <span className="ml-0.5 font-semibold">{returnTime(times)}</span>
    </div>
  );
}
