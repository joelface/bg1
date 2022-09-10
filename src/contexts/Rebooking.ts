import { createContext, useContext } from 'react';

import { LightningLane } from '@/api/genie';

export interface Rebooking {
  current: LightningLane | null;
  begin: (booking: LightningLane) => void;
  end: (canceled?: boolean) => void;
}

export const RebookingContext = createContext<Rebooking>({
  current: null,
  begin: () => null,
  end: () => null,
});
export const RebookingProvider = RebookingContext.Provider;
export const useRebooking = () => useContext(RebookingContext);
