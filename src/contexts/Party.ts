import { Guest, Guests } from '@/api/genie';
import { createContext } from '@/context';

export interface Party extends Guests {
  selected: Guest[];
  setSelected: (guests: Guest[]) => void;
  experience: {
    name: string;
    park: { name: string; theme: { bg: string; text: string } };
  };
}

export const [PartyProvider, useParty] = createContext<Party>({
  eligible: [],
  ineligible: [],
  selected: [],
  setSelected: () => undefined,
  experience: { name: '', park: { name: '', theme: { bg: '', text: '' } } },
});
