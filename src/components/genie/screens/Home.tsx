import { useEffect, useRef } from 'react';

import { withTabs } from '@/components/Tab';
import {
  ExperiencesProvider,
  useExperiencesState,
} from '@/contexts/Experiences';
import { useNav } from '@/contexts/Nav';
import { useRebooking } from '@/contexts/Rebooking';
import { ThemeProvider } from '@/contexts/Theme';
import ClockIcon from '@/icons/ClockIcon';
import LightningIcon from '@/icons/LightningIcon';
import onVisible from '@/onVisible';

import GeniePlusList from './Home/GeniePlusList';
import SettingsButton from './Home/SettingsButton';
import TimesGuide from './Home/TimesGuide';

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
];

const footer = <SettingsButton />;

const Home = withTabs({ tabs, footer }, ({ tab }) => {
  const { goBack } = useNav();
  const rebooking = useRebooking();
  const exps = useExperiencesState();
  const { park, setPark, refreshExperiences } = exps;
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(DEFAULT_TAB_KEY, tab.name);
  }, [tab]);

  useEffect(() => {
    return onVisible(() => {
      refreshExperiences(AUTO_REFRESH_MIN_MS);
    });
  }, [refreshExperiences]);

  useEffect(() => {
    if (!rebooking.current) return;
    setPark(rebooking.current.park);
    goBack({ screen: Home, props: { tabName: 'Genie+' } }).then(() =>
      contentRef.current?.scroll(0, 0)
    );
  }, [rebooking, goBack, setPark]);

  return (
    <ThemeProvider value={park.theme}>
      <ExperiencesProvider value={exps}>
        <tab.component contentRef={contentRef} />
      </ExperiencesProvider>
    </ThemeProvider>
  );
});

export default Home;
