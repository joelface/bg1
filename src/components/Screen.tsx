import { Theme, ThemeProvider, useTheme } from '@/contexts/Theme';

import HeaderBar from './HeaderBar';

export interface ScreenProps {
  heading: React.ReactNode;
  children: React.ReactNode;
  buttons?: React.ReactNode;
  footer?: React.ReactNode;
  theme?: Theme;
  contentRef?: React.MutableRefObject<HTMLDivElement | null>;
}

export interface ScreenRef {
  scroll: (x: number, y: number) => void;
}

export default function Screen({
  heading,
  buttons,
  footer,
  theme,
  children,
  contentRef,
}: ScreenProps) {
  const defaultTheme = useTheme();
  theme ??= defaultTheme;

  return (
    <ThemeProvider value={theme}>
      <div className="fixed inset-0 flex flex-col">
        <HeaderBar title={heading}>{buttons}</HeaderBar>
        <div ref={contentRef} className="flex-1 overflow-auto px-3 pb-3">
          {children}
        </div>
        {footer && (
          <div className={`relative ${theme.bg} text-white font-semibold`}>
            {footer}
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
