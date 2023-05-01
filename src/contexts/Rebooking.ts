import { useState } from 'react';

import { LightningLane } from '@/api/genie';
import { createContext } from '@/context';

export interface Rebooking {
  current: LightningLane | undefined;
  begin: (booking: LightningLane) => void;
  end: () => void;
}

export const [RebookingProvider, useRebooking] = createContext<Rebooking>({
  current: undefined,
  begin: () => undefined,
  end: () => undefined,
});

export function useRebookingState() {
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
}
