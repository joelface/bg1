import { useCallback, useEffect, useState } from 'react';

import Clock from './Clock';

export const TIME_IS_IDS = {
  WDW: 'Orlando_z161',
  DLR: 'Anaheim_z14e',
};

const SYNC_WAIT_MS = 5000;

export default function TimeBoard({
  resort,
  time,
  label,
}: {
  resort: keyof typeof TIME_IS_IDS;
  label: string;
  time?: string | null;
}) {
  const id = TIME_IS_IDS[resort];
  const [synced, setSynced] = useState<boolean | null>(null);

  useEffect(() => {
    setTimeout(() => setSynced(synced => synced || false), SYNC_WAIT_MS);
  }, []);

  const onSync = useCallback(() => setSynced(true), []);

  return (
    <table className="mt-4 mx-auto text-gray-500">
      <tbody>
        <Row heading={label} time={<time>{time || '--:--:--'}</time>} />
        <Row
          heading={
            <a
              href={`https://time.is/${id.split('_')[0]}`}
              id="time_is_link"
              target="_blank"
              rel="noreferrer"
            >
              Current time
            </a>
          }
          time={
            <>
              <Clock id={id} onSync={onSync} />
              {synced === false ? (
                <span className="text-sm font-sans font-semibold text-red-600">
                  {' '}
                  (unsynced)
                </span>
              ) : null}
            </>
          }
        />
      </tbody>
    </table>
  );
}

function Row({
  heading,
  time,
}: {
  heading: React.ReactNode;
  time: React.ReactNode;
}) {
  return (
    <tr>
      <th
        scope="row"
        className="pr-3 text-right text-xs font-semibold uppercase"
      >
        {heading}:
      </th>
      <td className="text-xl font-mono leading-tight">&#xfeff;{time}</td>
    </tr>
  );
}
