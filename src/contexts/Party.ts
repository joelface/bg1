import { Guest, Guests } from '@/api/genie';
import { createContext, useContext } from 'react';

export interface Party extends Guests {
  selected: Guest[];
  setSelected: (guests: Guest[]) => void;
}

export const EMPTY_PARTY = {
  eligible: [],
  ineligible: [],
  selected: [],
  setSelected: () => null,
};

export const PartyContext = createContext<Party>(EMPTY_PARTY);
export const PartyProvider = PartyContext.Provider;
export const useParty = () => useContext(PartyContext);
