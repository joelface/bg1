import { useMemo } from 'react';

import Select from '@/components/Select';
import { usePark } from '@/contexts/Park';
import { useResortData } from '@/contexts/ResortData';

export default function ParkSelect(props: { className?: string }) {
  const { parks } = useResortData();
  const { park, setPark } = usePark();

  const parkOptions = useMemo(
    () =>
      new Map(
        [...parks.values()].map(park => [
          park.id,
          {
            value: park,
            icon: park.icon,
            text: park.name,
          },
        ])
      ),
    [parks]
  );

  return (
    <Select
      {...props}
      options={parkOptions}
      selected={park.id}
      onChange={setPark}
      title="Park"
      data-testid="park-select"
    />
  );
}
