import { createContext } from '@/context';

export interface Theme {
  bg: string;
  text: string;
}

export const DEFAULT_THEME = {
  bg: 'bg-blue-500',
  text: 'text-blue-500',
} as const;

export const [ThemeProvider, useTheme] = createContext<Theme>(DEFAULT_THEME);
