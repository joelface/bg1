import { createContext, useContext, useEffect, useState } from 'react';

import { DasParty } from '@/api/das';

import { useResort } from './Resort';

const DasPartiesContext = createContext<Public<DasParty[]>>([]);
export const DasPartiesProvider = DasPartiesContext.Provider;
export const useDasParties = () => useContext(DasPartiesContext);

export function useDasPartiesState() {
  const { das } = useResort();
  const [parties, setParties] = useState<DasParty[]>([]);

  useEffect(() => {
    das.parties().then(setParties);
  }, [das]);

  return parties;
}
