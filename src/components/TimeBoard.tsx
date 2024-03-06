import { useState } from 'react';

import Clock from './Clock';

export default function TimeBoard({
  time,
  label,
}: {
  label: string;
  time?: string | null;
}) {
  const [synced, setSynced] = useState(true);

  return (
    <table className="mt-4 mx-auto text-gray-500">
      <tbody>
        <Row heading={label} time={<time>{time || '--:--:--'}</time>} />
        <Row
          heading="Current time"
          time={
            <>
              <Clock onSync={setSynced} />
              {!synced && (
                <span className="text-sm font-sans font-semibold text-red-600">
                  {' '}
                  (unsynced)
                </span>
              )}
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
