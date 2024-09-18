import { createContext, useContext, useEffect, useState } from 'react';

import { RequestError } from '@/api/client';
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
    (async () => {
      try {
        setParties(await das.parties());
      } catch (error) {
        if (error instanceof RequestError) return;
        throw error;
      }
    })();
  }, [das]);

  return (
    <DasPartiesContext.Provider value={parties}>
      {children}
    </DasPartiesContext.Provider>
  );
}
