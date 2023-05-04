import { useState } from 'react';

import { Park } from '@/api/data';
import { createContext } from '@/context';
import { dateTimeStrings } from '@/datetime';

import { useGenieClient } from './GenieClient';

const PARK_KEY = 'bg1.genie.park';

interface ParkState {
  park: Park;
  setPark: (park: Park) => void;
}

export const [ParkProvider, usePark] = createContext<ParkState>({
  park: {
    id: '',
    name: '',
    icon: '',
    geo: { n: 0, s: 0, e: 0, w: 0 },
    theme: { bg: '', text: '' },
  },
  setPark: () => undefined,
});

export function useParkState() {
  const client = useGenieClient();
  const { parks } = client;
  const [park, setPark] = useState(() => {
    const { id = parks[0].id, date = '' } =
      JSON.parse(sessionStorage.getItem(PARK_KEY) || '{}') || {};
    return (
      (date === dateTimeStrings().date && parks.find(p => p.id === id)) ||
      parks[0]
    );
  });

  return { park, setPark };
}
