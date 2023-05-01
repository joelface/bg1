import { useCallback, useEffect, useState } from 'react';

import { Booking } from '@/api/genie';
import { createContext } from '@/context';
import { useGenieClient } from '@/contexts/GenieClient';
import useDataLoader from '@/hooks/useDataLoader';
import useThrottleable from '@/hooks/useThrottleable';

interface PlansState {
  plans: Booking[];
  refreshPlans: ReturnType<typeof useThrottleable>;
  loaderElem: ReturnType<typeof useDataLoader>['loaderElem'];
}

export const [PlansProvider, usePlans] = createContext<PlansState>({
  plans: [],
  refreshPlans: () => undefined,
  loaderElem: null,
});

export function usePlansState() {
  const client = useGenieClient();
  const { loadData, loaderElem } = useDataLoader();
  const [plans, setPlans] = useState<Booking[]>([]);

  const refreshPlans = useThrottleable(
    useCallback(() => {
      loadData(async () => {
        setPlans(await client.bookings());
      });
    }, [client, loadData])
  );

  useEffect(refreshPlans, [refreshPlans]);

  return { plans, refreshPlans, loaderElem };
}
