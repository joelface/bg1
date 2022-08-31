import { createContext, useContext } from 'react';

import { Park } from '@/api/genie';

export const ParkContext = createContext<Park | undefined>(undefined);
export const ParkProvider = ParkContext.Provider;
export const usePark = () => useContext(ParkContext);
