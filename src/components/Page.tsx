import { h, ComponentChildren, Ref } from 'preact';

import { Theme, ThemeProvider, DEFAULT_THEME } from '@/contexts/Theme';
import HeaderBar from './HeaderBar';
import Overlay from './Overlay';

type Props = Omit<Parameters<typeof Overlay>[0], 'className'> & {
  heading: string | ComponentChildren;
  buttons?: ComponentChildren;
  className?: string;
  theme?: Theme;
  containerRef?: Ref<HTMLDivElement>;
};

export default function Page({
  heading,
  buttons,
  className,
  theme,
  containerRef,
  children,
  ...attrs
}: Props): h.JSX.Element {
  return (
    <ThemeProvider value={theme || DEFAULT_THEME}>
      <Overlay
        className={{
          outer: `bg-white ${className || ''}`,
          inner: `flex flex-col max-w-2xl h-full`,
        }}
        {...attrs}
      >
        <HeaderBar title={heading}>{buttons}</HeaderBar>
        <div ref={containerRef} className="flex-1 overflow-auto px-3 pb-3">
          {children}
        </div>
      </Overlay>
    </ThemeProvider>
  );
}
