import { useState } from 'react';

import { Park } from '@/api/data';
import { createContext } from '@/context';
import { dateTimeStrings } from '@/datetime';

import { useResortData } from './ResortData';

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
  const { parks } = useResortData();
  const [park, setPark] = useState(() => {
    const firstPark = [...parks.values()][0];
    const { id = firstPark.id, date = '' } =
      JSON.parse(sessionStorage.getItem(PARK_KEY) || '{}') || {};
    return (date === dateTimeStrings().date && parks.get(id)) || firstPark;
  });

  return { park, setPark };
}
