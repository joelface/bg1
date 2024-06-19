import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Booking } from '@/api/genie';
import useDataLoader from '@/hooks/useDataLoader';
import useThrottleable from '@/hooks/useThrottleable';

import { useResort } from './Resort';

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
export const PlansProvider = PlansContext.Provider;
export const usePlans = () => useContext(PlansContext);

export function usePlansState() {
  const { genie } = useResort();
  const { loadData, loaderElem } = useDataLoader();
  const [plans, setPlans] = useState<Booking[]>([]);

  const refreshPlans = useThrottleable(
    useCallback(() => {
      loadData(async () => {
        setPlans(await genie.bookings());
      });
    }, [genie, loadData])
  );

  useEffect(refreshPlans, [refreshPlans]);

  return { plans, refreshPlans, loaderElem };
}
