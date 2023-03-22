import { createContext, useContext, useEffect, useRef, useState } from 'react';

export interface NavMethods {
  goTo: (elem: JSX.Element, options?: { replace?: boolean }) => void;
  goBack: <P>(options?: {
    screen?: React.FC<P>;
    props?: Partial<P>;
  }) => Promise<void>;
}

export const NavContext = createContext<NavMethods>({
  goTo: () => undefined,
  goBack: async () => undefined,
});
export const NavProvider = NavContext.Provider;
export const useNav = () => useContext(NavContext);

export interface Screens {
  current: JSX.Element;
  prev?: JSX.Element;
}

export const ScreensContext = createContext<Screens>({ current: <div /> });
export const ScreensProvider = ScreensContext.Provider;
export const useScreens = () => useContext(ScreensContext);

let keyInc = 0;
const nextKey = () => ++keyInc;

const getHashPos = () => Number(location.hash.slice(1)) || 0;

export function Nav({ children }: { children: JSX.Element }) {
  const [screens, setScreens] = useState<Screens>({ current: children });
  const stack = useRef<{ elem: JSX.Element; key: number }[]>([
    { elem: children, key: 0 },
  ]);
  const nav = useRef({
    goTo(elem: JSX.Element, options?: { replace?: boolean }) {
      let pos = getHashPos();
      let key: number;
      if (options?.replace) {
        key = stack.current[pos].key ?? nextKey();
        setScreens({ ...screens, current: elem });
      } else {
        stack.current = stack.current.slice(0, ++pos);
        location.hash = `#${pos}`;
        key = nextKey();
      }
      stack.current[pos] = { elem, key };
    },
    async goBack({
      screen: Screen,
      props,
    }: { screen?: React.FC<any>; props?: { [id: string]: any } } = {}) {
      if (Screen) {
        const pos = getHashPos();
        for (let i = pos - 1; i >= 0; --i) {
          if (stack.current[i].elem.type === Screen) {
            history.go(i - pos);
            if (props) {
              const newProps = { ...stack.current[i].elem.props, ...props };
              stack.current[i].elem = <Screen {...newProps} />;
            }
            return;
          }
        }
      } else {
        history.back();
      }
    },
  });

  useEffect(() => {
    function onHashChange() {
      const pos = getHashPos();
      if (pos >= stack.current.length) {
        history.back();
      } else {
        setScreens({
          current: stack.current[pos]?.elem ?? <div />,
          prev: stack.current[pos - 1]?.elem,
        });
      }
    }

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    location.replace('#0');
    addEventListener('hashchange', onHashChange);
    addEventListener('beforeunload', onBeforeUnload);
    return () => {
      removeEventListener('hashchange', onHashChange);
      removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  const pos = Math.min(getHashPos(), stack.current.length - 1);
  return (
    <NavProvider value={nav.current}>
      <ScreensProvider value={screens}>
        {stack.current.slice(0, pos + 1).map(({ elem, key }, idx) => {
          const hidden = idx !== pos;
          return (
            <article key={key} hidden={hidden}>
              {elem}
            </article>
          );
        })}
      </ScreensProvider>
    </NavProvider>
  );
}
