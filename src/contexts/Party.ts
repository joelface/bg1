import { Guest, Guests } from '/api/genie';
import { createContext, useContext } from 'react';

export interface Party extends Guests {
  selected: Guest[];
  setSelected: (guests: Guest[]) => void;
}

export const PartyContext = createContext<Party>({
  eligible: [],
  ineligible: [],
  selected: [],
  setSelected: () => null,
});
export const PartyProvider = PartyContext.Provider;
export const useParty = () => useContext(PartyContext);
