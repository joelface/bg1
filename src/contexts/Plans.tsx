import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Booking } from '@/api/itinerary';
import useDataLoader from '@/hooks/useDataLoader';
import useThrottleable from '@/hooks/useThrottleable';

import { useClients } from './Clients';

interface PlansState {
  plans: Booking[];
  refreshPlans: ReturnType<typeof useThrottleable>;
  loaderElem: ReturnType<typeof useDataLoader>['loaderElem'];
}

export const PlansContext = createContext<PlansState>({
  plans: [],
  refreshPlans: () => undefined,
  loaderElem: null,
});
export const usePlans = () => useContext(PlansContext);

export function PlansProvider({ children }: { children: React.ReactNode }) {
  const { itinerary } = useClients();
  const { loadData, loaderElem } = useDataLoader();
  const [plans, setPlans] = useState<Booking[]>([]);

  const refreshPlans = useThrottleable(
    useCallback(() => {
      loadData(async () => {
        setPlans(await itinerary.plans());
      });
    }, [itinerary, loadData])
  );

  useEffect(refreshPlans, [refreshPlans]);

  return (
    <PlansContext.Provider value={{ plans, refreshPlans, loaderElem }}>
      {children}
    </PlansContext.Provider>
  );
}
