import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { LightningLane } from '@/api/genie';
import Button from '@/components/Button';
import Screen from '@/components/Screen';
import Select from '@/components/Select';
import { useGenieClient } from '@/contexts/GenieClient';
import { ModalProvider } from '@/contexts/Modal';
import { Rebooking, RebookingProvider } from '@/contexts/Rebooking';
import ClockIcon from '@/icons/ClockIcon';
import LightningIcon from '@/icons/LightningIcon';
import RefreshIcon from '@/icons/RefreshIcon';
import SettingsIcon from '@/icons/SettingsIcon';

import YourDayButton from '../YourDayButton';
import GeniePlusList from './Home/GeniePlusList';
import TimesGuide from './Home/TimesGuide';
import useExperiences, {
  Experience,
  PlusExperience,
  SortType,
} from './Home/useExperiences';
import usePark from './Home/usePark';
import Settings from './Settings';

export type { Experience, PlusExperience };

const SCREEN_KEY = 'bg1.merlock.screen';

const sortOptions = new Map<SortType, { text: string }>([
  ['priority', { text: 'Priority' }],
  ['nearby', { text: 'Nearby' }],
  ['standby', { text: 'Standby' }],
  ['soonest', { text: 'Soonest' }],
  ['aToZ', { text: 'A to Z' }],
]);

type ScreenName = 'Genie+' | 'Times';

export interface ScreenProps<E extends Experience = Experience> {
  park: E['park'];
  experiences: E[];
  refresh: (force?: boolean) => void;
  toggleStar: (exp: E) => void;
}

interface ScreenDef<
  P extends boolean = false,
  E extends Experience = P extends true ? PlusExperience : Experience
> {
  title: React.ReactNode;
  component: (props: ScreenProps<E>) => JSX.Element;
  plusOnly?: P;
  sortType?: SortType;
}

const screens: { [key in ScreenName]: ScreenDef | ScreenDef<true> } = {
  'Genie+': {
    title: (
      <>
        G<span className="hidden xs:inline">enie</span>+
      </>
    ),
    component: GeniePlusList,
    plusOnly: true,
  },
  Times: {
    title: 'Times',
    component: TimesGuide,
    sortType: 'land',
  },
};

interface Screen extends ScreenDef<any, any> {
  name: ScreenName;
  change: (screenName: ScreenName) => void;
}

const ScreenContext = createContext<Screen>({
  ...screens['Genie+'],
  name: 'Genie+',
  change: () => undefined,
});

export default function Merlock() {
  const { parks } = useGenieClient();
  const [park, setPark] = usePark();
  const [screen, setScreen] = useState<Screen>(() => {
    const name: ScreenName =
      ({ 'Genie+': 'Genie+', Times: 'Times' } as const)[
        String(localStorage.getItem(SCREEN_KEY))
      ] ?? 'Genie+';
    return {
      ...screens[name],
      name,
      change: (screenName: ScreenName) => {
        setScreen(screen => {
          if (screenName !== screen.name) {
            setHidden(true);
            scrollPos.current[screen.name] = pageElem.current?.scrollTop ?? 0;
            screen = {
              ...screens[screenName],
              name: screenName,
              change: screen.change,
            };
            localStorage.setItem(SCREEN_KEY, screenName);
          }
          return screen;
        });
      },
    };
  });
  const [hidden, setHidden] = useState(true);
  const [sortType, sort] = useState<SortType>('priority');
  const { experiences, refresh, toggleStar, isLoading, loaderElem } =
    useExperiences({
      park,
      sortType: screen.sortType ?? sortType,
      plusOnly: !!screen.plusOnly,
    });
  const [modal, setModal] = useState({
    elem: null as React.ReactNode,
    show: (elem: React.ReactNode) => setModal({ ...modal, elem }),
    close: () => setModal(modal => ({ ...modal, elem: null })),
  });
  const [rebooking, setRebooking] = useState<Rebooking>({
    current: undefined,
    begin: (booking: LightningLane) => {
      setRebooking({ ...rebooking, current: booking });
      screen.change('Genie+');
      setPark(booking.park);
      modal.close();
    },
    end: (canceled = false) => {
      setRebooking(rebooking =>
        rebooking.current ? { ...rebooking, current: undefined } : rebooking
      );
      if (canceled) modal.close();
    },
  });
  const pageElem = useRef<HTMLDivElement>(null);
  const scrollPos = useRef<Partial<{ [screenName in ScreenName]: number }>>({});

  useEffect(() => {
    if (isLoading) return;
    const refreshIfVisible = () => {
      if (!document.hidden) refresh(false);
    };
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [refresh, isLoading]);

  useEffect(() => {
    setHidden(false);
    pageElem.current?.scroll(0, scrollPos.current[screen.name] ?? 0);
  }, [screen.name]);

  useEffect(() => {
    if (!isLoading) setHidden(false);
  }, [isLoading]);

  useEffect(() => {
    setHidden(true);
    scrollPos.current = {};
  }, [park]);

  useEffect(() => {
    pageElem.current?.scroll(0, 0);
  }, [park, sortType, rebooking]);

  const parkOptions = useMemo(
    () =>
      new Map(
        parks.map(park => [
          park.id,
          {
            value: park,
            icon: park.icon,
            text: park.name,
          },
        ])
      ),
    [parks]
  );

  return (
    <RebookingProvider value={rebooking}>
      <Screen
        heading={screen.title}
        theme={park.theme}
        buttons={
          <>
            {screen.sortType === undefined && (
              <Select
                options={sortOptions}
                selected={sortType}
                onChange={sort}
                title="Sort By"
              />
            )}

            <Select
              options={parkOptions}
              selected={park.id}
              onChange={setPark}
              title="Park"
              data-testid="park-select"
            />

            <YourDayButton onOpen={modal.show} onClose={modal.close} />

            <Button onClick={refresh} title="Refresh Times">
              <RefreshIcon />
            </Button>
          </>
        }
        containerRef={pageElem}
      >
        <ModalProvider value={modal}>
          <div
            aria-hidden={!!modal.elem}
            className={`${hidden && 'invisible'} mb-14`}
          >
            <screen.component
              park={park}
              experiences={experiences as PlusExperience[]}
              refresh={refresh}
              toggleStar={toggleStar}
            />
          </div>
          {!modal.elem && loaderElem}
          {modal.elem}
        </ModalProvider>
        <div
          className={`fixed bottom-0 left-0 w-full ${park.theme.bg} text-white font-semibold`}
        >
          <div className={`flex items-center justify-center`}>
            <ScreenContext.Provider value={screen}>
              <NavButton name="Genie+" icon={LightningIcon} />
              <NavButton name="Times" icon={ClockIcon} />
            </ScreenContext.Provider>
            <button
              className="absolute top-0 right-0 h-full px-3"
              onClick={() => modal.show(<Settings onClose={modal.close} />)}
              title="Settings"
            >
              <SettingsIcon />
            </button>
          </div>
        </div>
      </Screen>
    </RebookingProvider>
  );
}

function NavButton({
  name,
  icon: Icon,
}: {
  name: ScreenName;
  icon: React.FunctionComponent;
}) {
  const screen = useContext(ScreenContext);
  return (
    <button
      className={`flex items-center gap-x-2 border-b-4 ${
        name === screen.name ? 'border-white' : 'border-transparent'
      } px-3 pt-3 pb-2`}
      onClick={() => screen.change(name)}
    >
      <Icon />
      {name}
    </button>
  );
}
