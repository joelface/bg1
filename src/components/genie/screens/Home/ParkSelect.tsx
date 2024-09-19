import { useMemo } from 'react';

import Select from '@/components/Select';
import { useClients } from '@/contexts/Clients';
import { usePark } from '@/contexts/Park';
import { useRebooking } from '@/contexts/Rebooking';
import { useResort } from '@/contexts/Resort';

export default function ParkSelect(props: { className?: string }) {
  const { parks } = useResort();
  const { ll } = useClients();
  const { park, setPark } = usePark();
  const rebooking = useRebooking();

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
      disabled={!!rebooking.current && !ll.rules.parkModify}
      title="Park"
    />
  );
}
