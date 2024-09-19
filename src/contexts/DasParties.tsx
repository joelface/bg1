import { createContext, useContext, useEffect, useState } from 'react';

import { DasParty } from '@/api/das';

import { useClients } from './Clients';

export const DasPartiesContext = createContext<Public<DasParty[]>>([]);
export const useDasParties = () => useContext(DasPartiesContext);

export function DasPartiesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { das } = useClients();
  const [parties, setParties] = useState<DasParty[]>([]);

  useEffect(() => {
    das.parties().then(setParties);
  }, [das]);

  return (
    <DasPartiesContext.Provider value={parties}>
      {children}
    </DasPartiesContext.Provider>
  );
}
