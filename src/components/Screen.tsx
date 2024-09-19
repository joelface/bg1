import { Theme, ThemeProvider, useTheme } from '@/contexts/Theme';

import HeaderBar from './HeaderBar';

export interface ScreenProps {
  title: React.ReactNode;
  children: React.ReactNode;
  buttons?: React.ReactNode;
  subhead?: React.ReactNode;
  footer?: React.ReactNode;
  theme?: Theme;
  contentRef?: React.MutableRefObject<HTMLDivElement | null>;
}

export interface ScreenRef {
  scroll: (x: number, y: number) => void;
}

export default function Screen({
  title,
  buttons,
  subhead,
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
        <HeaderBar title={title} subhead={subhead}>
          {buttons}
        </HeaderBar>
        <div
          ref={contentRef}
          className="relative flex-1 overflow-auto px-3 pb-5"
        >
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
