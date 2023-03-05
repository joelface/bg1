import { createContext, useContext, useState } from 'react';

import { LightningLane } from '@/api/genie';

export interface Rebooking {
  current: LightningLane | undefined;
  begin: (booking: LightningLane) => void;
  end: (canceled?: boolean) => void;
}

export const RebookingContext = createContext<Rebooking>({
  current: undefined,
  begin: () => null,
  end: () => null,
});
export const RebookingProvider = RebookingContext.Provider;
export const useRebooking = () => useContext(RebookingContext);
export const useRebookingState = () => {
  const [rebooking, setRebooking] = useState<Rebooking>({
    current: undefined,
    begin: (booking: LightningLane) => {
      setRebooking({ ...rebooking, current: booking });
    },
    end: () => {
      setRebooking(rebooking =>
        rebooking.current ? { ...rebooking, current: undefined } : rebooking
      );
    },
  });
  return rebooking;
};
