import { createContext, useContext } from 'react';

import { DasClient } from '@/api/das';

const DasClientContext = createContext<Public<DasClient>>({} as DasClient);
export const DasClientProvider = DasClientContext.Provider;
export const useDasClient = () => useContext(DasClientContext);
