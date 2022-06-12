import { createContext, useContext } from 'react';

import { Booking } from '/api/genie';

export interface Rebooking {
  current: Booking | null;
  begin: (booking: Booking) => void;
  end: (canceled?: boolean) => void;
}

export const RebookingContext = createContext<Rebooking>({
  current: null,
  begin: () => null,
  end: () => null,
});
export const RebookingProvider = RebookingContext.Provider;
export const useRebooking = () => useContext(RebookingContext);
