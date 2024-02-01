import ReturnWindow from './ReturnWindow';

export default function ReturnTime({
  start,
  end,
}: Parameters<typeof ReturnWindow>[0]) {
  return (
    <div className="mt-4 text-lg">
      {end ? 'Arrive by' : 'Reservation at'}:{' '}
      <span className="pl-1 font-semibold">
        <ReturnWindow start={start} end={end} />
      </span>
    </div>
  );
}
