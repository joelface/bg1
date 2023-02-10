import { useEffect, useState } from 'react';

import { Park } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import { dateTimeStrings } from '@/datetime';

const PARK_KEY = 'bg1.merlock.park';

export default function usePark(): [Park, typeof setPark] {
  const { parks } = useGenieClient();
  const [park, setPark] = useState(() => {
    const { id = parks[0].id, date = '' } =
      JSON.parse(sessionStorage.getItem(PARK_KEY) || '{}') || {};
    return (
      (date === dateTimeStrings().date && parks.find(p => p.id === id)) ||
      parks[0]
    );
  });

  useEffect(() => {
    sessionStorage.setItem(
      PARK_KEY,
      JSON.stringify({ id: park.id, date: dateTimeStrings().date })
    );
  }, [park]);

  return [park, setPark];
}
