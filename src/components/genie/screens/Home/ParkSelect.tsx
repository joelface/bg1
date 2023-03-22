import { useMemo } from 'react';

import Select from '@/components/Select';
import { useGenieClient } from '@/contexts/GenieClient';
import { usePark } from '@/contexts/Park';

export default function ParkSelect(props: { className?: string }) {
  const { parks } = useGenieClient();
  const { park, setPark } = usePark();

  const parkOptions = useMemo(
    () =>
      new Map(
        parks.map(park => [
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
