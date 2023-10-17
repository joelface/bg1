import { useEffect, useRef, useState } from 'react';

import {
  PlusExperience as BasePlusExp,
  getNextAvailableTime,
  getPreexistingPlan,
} from '@/api/genie';
import Screen from '@/components/Screen';
import Tab from '@/components/Tab';
import { useExperiences } from '@/contexts/Experiences';
import { useGenieClient } from '@/contexts/GenieClient';
import { useNav } from '@/contexts/Nav';
import { usePark } from '@/contexts/Park';
import { useTheme } from '@/contexts/Theme';
import { dateTimeStrings, displayTime, timeToMinutes } from '@/datetime';
import CheckmarkIcon from '@/icons/CheckmarkIcon';
import DropIcon from '@/icons/DropIcon';
import LightningIcon from '@/icons/LightningIcon';
import StarIcon from '@/icons/StarIcon';

import { ExperienceList } from '../../ExperienceList';
import RebookingHeader from '../../RebookingHeader';
import { HomeTabProps } from '../Home';
import { useSelectedParty } from '../PartySelector';
import RefreshButton from '../RefreshButton';
import GeniePlusButton from './GeniePlusButton';
import Legend, { Symbol } from './Legend';
import ParkSelect from './ParkSelect';
import StandbyTime from './StandbyTime';
import TimeBanner from './TimeBanner';
import useSort from './useSort';

const LP_MIN_STANDBY = 30;
const LP_MAX_LL_WAIT = 60;
export const STARRED_KEY = 'bg1.genie.tipBoard.starred';
const LIGHTNING_PICK = 'Lightning Pick';
const UPCOMING_DROP = 'Upcoming Drop';
const BOOKED = 'Booked';

export interface PlusExperience extends BasePlusExp {
  lp: boolean;
  starred: boolean;
}

const isExperienced = (exp: PlusExperience) => exp.experienced && !exp.starred;

export default function GeniePlusList({ contentRef }: HomeTabProps) {
  useSelectedParty();
  const { goTo } = useNav();
  const client = useGenieClient();
  const { park } = usePark();
  const { experiences, refreshExperiences, loaderElem } = useExperiences();
  const { sorter, SortSelect } = useSort();
  const theme = useTheme();
  const [starred, setStarred] = useState<Set<string>>(() => {
    const ids = JSON.parse(localStorage.getItem(STARRED_KEY) || '[]');
    return new Set(Array.isArray(ids) ? ids : []);
  });
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
    } else {
      contentRef.current?.scroll(0, 0);
    }
  }, [SortSelect, contentRef]);

  function toggleStar({ id }: { id: string }) {
    setStarred(starred => {
      starred = new Set(starred);
      if (starred.has(id)) {
        starred.delete(id);
      } else {
        starred.add(id);
      }
      localStorage.setItem(STARRED_KEY, JSON.stringify([...starred]));
      return starred;
    });
  }

  const dropTime = client.nextDropTime(park);

  const showLightningPickDesc = () => goTo(<LightningPickDesc />);
  const showDropTimeDesc = () =>
    goTo(<DropTimeDesc dropTime={dropTime} park={park} />);
  const showBookedDesc = () => goTo(<BookedDesc />);

  const expListItem = (exp: PlusExperience) => (
    <li
      className="pb-3 first:border-0 border-t-4 border-gray-300"
      key={exp.id + (exp.starred ? '*' : '')}
    >
      <div className="flex items-center gap-x-2 mt-2">
        <StarButton experience={exp} toggleStar={toggleStar} />
        <h3 className="flex-1 mt-0 text-lg font-semibold leading-tight truncate">
          {exp.name}
        </h3>
        {exp.lp ? (
          <InfoButton
            name={LIGHTNING_PICK}
            icon={LightningIcon}
            onClick={showLightningPickDesc}
          />
        ) : dropTime && exp.drop ? (
          <InfoButton
            name={UPCOMING_DROP}
            icon={DropIcon}
            onClick={showDropTimeDesc}
          />
        ) : null}
        {getPreexistingPlan(exp) && (
          <InfoButton
            name={BOOKED}
            icon={CheckmarkIcon}
            onClick={showBookedDesc}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        <StandbyTime experience={exp} />
        <GeniePlusButton experience={exp} />
      </div>
    </li>
  );

  const nowMinutes = timeToMinutes(dateTimeStrings().time);
  const plusExps = experiences
    .filter((exp): exp is BasePlusExp => !!exp.flex || !!exp.individual)
    .map(exp => {
      const standby = exp.standby.waitTime || 0;
      const returnTime = getNextAvailableTime(exp);
      return {
        ...exp,
        lp:
          !!returnTime &&
          standby >= LP_MIN_STANDBY &&
          timeToMinutes(returnTime) - nowMinutes <=
            Math.min(
              LP_MAX_LL_WAIT,
              ((4 - Math.trunc(exp.priority || 4)) / 3) * standby
            ),
        starred: starred.has(exp.id),
      };
    })
    .sort(
      (a, b) => +!a.starred - +!b.starred || +!a.lp - +!b.lp || sorter(a, b)
    );
  const unexperienced = plusExps.filter(exp => !isExperienced(exp));
  const experienced = plusExps
    .filter(isExperienced)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Tab
      heading="Genie+"
      buttons={
        <>
          <SortSelect />
          <ParkSelect />
          <RefreshButton name="Experiences" onClick={refreshExperiences} />
        </>
      }
      contentRef={contentRef}
    >
      <RebookingHeader />
      <TimeBanner bookTime={client.nextBookTime} dropTime={dropTime} />
      <ul data-testid="unexperienced">{unexperienced.map(expListItem)}</ul>
      {experienced.length > 0 && (
        <>
          <h2
            className={`-mx-3 px-3 py-1 text-sm uppercase text-center ${theme.bg} text-white`}
          >
            Previously Experienced
          </h2>
          <ul data-testid="experienced">{experienced.map(expListItem)}</ul>
        </>
      )}
      {plusExps.length > 0 && (
        <Legend>
          <Symbol
            sym={<LightningIcon className={theme.text} />}
            def={LIGHTNING_PICK}
            onInfo={showLightningPickDesc}
          />
          <Symbol
            sym={<DropIcon className={theme.text} />}
            def={UPCOMING_DROP}
            onInfo={showDropTimeDesc}
          />
          <Symbol
            sym={<CheckmarkIcon className={theme.text} />}
            def={BOOKED}
            onInfo={showBookedDesc}
          />
        </Legend>
      )}
      {loaderElem}
    </Tab>
  );
}

function InfoButton({
  name,
  icon: Icon,
  onClick,
}: {
  name: string;
  icon: React.FunctionComponent;
  onClick: () => void;
}) {
  const theme = useTheme();
  return (
    <button
      title={`${name} (more info)`}
      className={`-mx-2 px-2 ${theme.text}`}
      onClick={onClick}
    >
      {<Icon />}
    </button>
  );
}

function StarButton({
  experience,
  toggleStar,
}: {
  experience: PlusExperience;
  toggleStar: (exp: PlusExperience) => void;
}) {
  const theme = useTheme();
  return (
    <button
      title={`${experience.starred ? 'Remove from' : 'Add to'} Favorites`}
      className="-m-2 p-2"
      onClick={() => toggleStar(experience)}
    >
      <StarIcon className={experience.starred ? theme.text : 'text-gray-300'} />
    </button>
  );
}

function LightningPickDesc() {
  return (
    <Screen heading={LIGHTNING_PICK}>
      <p>
        When an attraction with a long standby wait has a Lightning Lane return
        time in the near future, it's highlighted as a Lightning Pick. Book
        these quick before they're gone!
      </p>
    </Screen>
  );
}

function DropTimeDesc({
  dropTime,
  park,
}: {
  dropTime?: string;
  park: PlusExperience['park'];
}) {
  const client = useGenieClient();
  const { bg } = useTheme();
  return (
    <Screen heading={UPCOMING_DROP}>
      <p>
        This attraction may be part of the{' '}
        {dropTime ? (
          <time dateTime={dropTime} className="font-semibold">
            {displayTime(dropTime)}
          </time>
        ) : (
          'next'
        )}{' '}
        drop of additional Lightning Lane inventory, with earlier return times
        than what's currently being offered. Availability varies but is always
        limited, so be sure you're ready to book when the drop time arrives!
      </p>
      {client.upcomingDrops(park).map(drop => (
        <ExperienceList
          heading={displayTime(drop.time)}
          experiences={drop.experiences}
          bg={bg}
          key={drop.time}
        />
      ))}
    </Screen>
  );
}

function BookedDesc() {
  return (
    <Screen heading={BOOKED}>
      <p>
        You currently have a Lightning Lane reservation for this attraction.
      </p>
    </Screen>
  );
}
