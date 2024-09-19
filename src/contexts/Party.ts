import { createContext, useContext } from 'react';

import { Guest, Guests } from '@/api/ll';

export interface Party extends Guests {
  selected: Guest[];
  setSelected: (guests: Guest[]) => void;
  experience: {
    name: string;
    park: { name: string; theme: { bg: string; text: string } };
  };
}

export const PartyContext = createContext<Party>({
  eligible: [],
  ineligible: [],
  selected: [],
  setSelected: () => null,
  experience: {
    name: '',
    park: { name: '', theme: { bg: '', text: '' } },
  },
});
export const PartyProvider = PartyContext.Provider;
export const useParty = () => useContext(PartyContext);
