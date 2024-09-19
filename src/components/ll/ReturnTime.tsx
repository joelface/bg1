import ReturnWindow from './ReturnWindow';

export default function ReturnTime({
  start,
  end,
  button,
}: Parameters<typeof ReturnWindow>[0] & { button?: React.ReactNode }) {
  return (
    <div className="mt-4 text-lg">
      <div className="flex items-center gap-x-3">
        <div>
          {end ? 'Arrive by' : 'Reservation at'}:{' '}
          <span className="pl-1 font-semibold">
            <ReturnWindow start={start} end={end} />
          </span>
        </div>
        <div>{button}</div>
      </div>
    </div>
  );
}
