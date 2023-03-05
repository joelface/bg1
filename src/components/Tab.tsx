import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
} from 'react';

import { useNav } from '@/contexts/Nav';
import { useTheme } from '@/contexts/Theme';

import Screen, { ScreenProps } from './Screen';

export interface TabDef {
  name: string;
  icon: JSX.Element;
  component: React.FC<any>;
}

const TabsContext = createContext<{
  tabs: TabDef[];
  active: TabDef;
  changeTab: (tab: TabDef['name']) => void;
  scrollPos: {
    get: () => number;
    set: (pos: number) => void;
  };
  footer?: React.ReactNode;
}>({
  tabs: [],
  active: {
    name: '',
    icon: <div />,
    component: () => null,
  },
  changeTab: () => undefined,
  scrollPos: { get: () => 0, set: () => undefined },
});
const useTabs = () => useContext(TabsContext);

function TabButton({ name, icon }: TabDef) {
  const theme = useTheme();
  const { active, changeTab } = useTabs();
  if (!changeTab) return null;
  const isActive = active?.name === name;
  const iconStyles = isActive
    ? `bg-white bg-opacity-90 ${theme.text}`
    : `${theme.bg} text-white`;
  return (
    <button className={`px-3 py-2`} onClick={() => changeTab(name)}>
      <div className={`min-w-[3rem] rounded-full py-1.5 ${iconStyles}`}>
        {icon}
      </div>
      <div className="mt-0.5 text-sm">{name}</div>
    </button>
  );
}

export function withTabs<T extends TabDef>(
  { tabs, footer }: { tabs: T[]; footer: React.ReactNode },
  Component: React.FC<{ tab: T }>
) {
  return function Tabbed({ tabName }: { tabName: T['name'] }) {
    const { goTo } = useNav();
    const changeTab = useCallback(
      (name: T['name']) => {
        if (name !== tabName) {
          goTo(<Tabbed tabName={name} />, { replace: true });
        }
      },
      [tabName, goTo]
    );
    const scrollPos = useRef(Object.fromEntries(tabs.map(t => [t.name, 0])));
    const active = tabs.find(({ name: title }) => title === tabName);

    if (!active) return null;

    return (
      <TabsContext.Provider
        value={{
          tabs,
          active,
          changeTab,
          scrollPos: {
            get: () => {
              return scrollPos.current[active.name];
            },
            set: pos => {
              scrollPos.current[active.name] = pos;
            },
          },
          footer,
        }}
      >
        <Component tab={active} />
      </TabsContext.Provider>
    );
  };
}

export default function Tab({
  heading,
  buttons,
  children,
  contentRef,
}: ScreenProps) {
  const { tabs, scrollPos, footer } = useTabs();
  let ref = useRef<HTMLDivElement | null>(null);
  if (contentRef) ref = contentRef;

  useLayoutEffect(() => {
    const elem = ref.current;
    if (!elem) return;
    elem.scroll(0, scrollPos.get());
    const updateScrollPos = () => scrollPos.set(elem.scrollTop);
    elem.addEventListener('scroll', updateScrollPos);
    return () => elem.removeEventListener('scroll', updateScrollPos);
  }, [scrollPos]);

  return (
    <Screen
      heading={heading}
      buttons={buttons}
      footer={
        <>
          <div className="flex items-center justify-center">
            {tabs.map(tab => (
              <TabButton {...tab} key={tab.name} />
            ))}
          </div>
          {footer}
        </>
      }
      contentRef={ref}
    >
      {children}
    </Screen>
  );
}
