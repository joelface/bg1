import { createContext, useContext, useEffect, useState } from 'react';

import { DasParty } from '@/api/das';

import { useDasClient } from './DasClient';

const DasPartiesContext = createContext<Public<DasParty[]>>([]);
export const DasPartiesProvider = DasPartiesContext.Provider;
export const useDasParties = () => useContext(DasPartiesContext);

export function useDasPartiesState() {
  const client = useDasClient();
  const [parties, setParties] = useState<DasParty[]>([]);

  useEffect(() => {
    client.parties().then(setParties);
  }, [client]);

  return parties;
}
