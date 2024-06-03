import { useMemo } from 'react';

import Select from '@/components/Select';
import { useExperiences } from '@/contexts/Experiences';
import { useRebooking } from '@/contexts/Rebooking';
import { useResort } from '@/contexts/Resort';

export default function ParkSelect(props: { className?: string }) {
  const { parks } = useResort();
  const { park, setPark } = useExperiences();
  const rebooking = useRebooking();

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
      disabled={!!rebooking.current}
      title="Park"
      data-testid="park-select"
    />
  );
}
