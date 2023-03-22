import { createContext, useContext, useState } from 'react';

import { Park } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import { dateTimeStrings } from '@/datetime';

const PARK_KEY = 'bg1.genie.park';

interface ParkState {
  park: Park;
  setPark: (park: Park) => void;
}

const ParkContext = createContext<ParkState>({
  park: {} as Park,
  setPark: () => undefined,
});
export const ParkProvider = ({
  value,
  children,
}: {
  value: ParkState;
  children: React.ReactNode;
}) => {
  return <ParkContext.Provider value={value}>{children}</ParkContext.Provider>;
};
export const usePark = () => useContext(ParkContext);

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
