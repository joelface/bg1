import { useEffect, useRef } from 'react';

import { withTabs } from '@/components/Tab';
import {
  ExperiencesProvider,
  useExperiencesState,
} from '@/contexts/Experiences';
import { useScreens } from '@/contexts/Nav';
import { usePark } from '@/contexts/Park';
import { usePlans } from '@/contexts/Plans';
import { useRebooking } from '@/contexts/Rebooking';
import { ThemeProvider } from '@/contexts/Theme';
import CalendarIcon from '@/icons/CalendarIcon';
import ClockIcon from '@/icons/ClockIcon';
import LightningIcon from '@/icons/LightningIcon';
import onVisible from '@/onVisible';

import GeniePlusList from './Home/GeniePlusList';
import SettingsButton from './Home/SettingsButton';
import TimesGuide from './Home/TimesGuide';
import Plans from './Plans';

const AUTO_REFRESH_MIN_MS = 60_000;
export const DEFAULT_TAB_KEY = 'bg1.genie.merlock.tab';

export const getDefaultTab = () =>
  localStorage.getItem(DEFAULT_TAB_KEY) ?? 'Genie+';

export interface HomeTabProps {
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
}

const tabs = [
  {
    name: 'Genie+',
    icon: <LightningIcon />,
    component: GeniePlusList,
  },
  {
    name: 'Times',
    icon: <ClockIcon />,
    component: TimesGuide,
  },
  {
    name: 'Plans',
    icon: <CalendarIcon />,
    component: Plans,
  },
];

const footer = <SettingsButton />;

const Home = withTabs({ tabs, footer }, ({ tab }) => {
  const { current } = useScreens();
  const rebooking = useRebooking();
  const { park } = usePark();
  const exps = useExperiencesState();
  const { refreshExperiences } = exps;
  const { refreshPlans } = usePlans();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(DEFAULT_TAB_KEY, tab.name);
  }, [tab]);

  useEffect(() => {
    return onVisible(() => {
      if (current.type !== Home) return;
      refreshExperiences(AUTO_REFRESH_MIN_MS);
      refreshPlans(AUTO_REFRESH_MIN_MS);
    });
  }, [current, refreshExperiences, refreshPlans]);

  useEffect(() => {
    if (rebooking.current) contentRef.current?.scroll(0, 0);
  }, [rebooking]);

  return (
    <ThemeProvider value={park.theme}>
      <ExperiencesProvider value={exps}>
        <tab.component contentRef={contentRef} />
      </ExperiencesProvider>
    </ThemeProvider>
  );
});

export default Home;
