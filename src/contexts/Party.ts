import { Guest, Guests } from '@/api/genie';
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

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
