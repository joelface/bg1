import { useMemo } from 'react';

import Select from '@/components/Select';
import { useExperiences } from '@/contexts/Experiences';
import { useGenieClient } from '@/contexts/GenieClient';

export default function ParkSelect(props: { className?: string }) {
  const { parks } = useGenieClient();
  const { park, setPark } = useExperiences();

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
