import { memo, useEffect, useRef, useState } from 'react';

import { PlusExperience as BasePlusExp, Experience } from '@/api/genie';
import { Park } from '@/api/resort';
import Screen from '@/components/Screen';
import Tab from '@/components/Tab';
import { useExperiences } from '@/contexts/Experiences';
import { useGenieClient } from '@/contexts/GenieClient';
import { useNav } from '@/contexts/Nav';
import { useResort } from '@/contexts/Resort';
import { useTheme } from '@/contexts/Theme';
import {
  dateTimeStrings,
  displayTime,
  timeToMinutes,
  upcomingTimes,
} from '@/datetime';
import CheckmarkIcon from '@/icons/CheckmarkIcon';
import DropIcon from '@/icons/DropIcon';
import LightningIcon from '@/icons/LightningIcon';
import StarIcon from '@/icons/StarIcon';
import kvdb from '@/kvdb';

import RebookingHeader from '../../RebookingHeader';
import { HomeTabProps } from '../Home';
import { useSelectedParty } from '../PartySelector';
import RefreshButton from '../RefreshButton';
import GeniePlusButton from './GeniePlusButton';
import Legend, { Symbol } from './Legend';
import ParkSelect from './ParkSelect';
import StandbyTime from './StandbyTime';
import TimeBanner from './TimeBanner';
import useSort, { Sorter } from './useSort';

const LP_MIN_STANDBY = 30;
const LP_MAX_LL_WAIT = 60;
export const STARRED_KEY = ['bg1', 'genie', 'tipBoard', 'starred'];
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
  const client = useGenieClient();
  const { experiences, refreshExperiences, park, loaderElem } =
    useExperiences();
  const { sorter, SortSelect } = useSort();
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (!firstUpdate.current) contentRef.current?.scroll(0, 0);
  }, [SortSelect, contentRef]);

  useEffect(() => {
    firstUpdate.current = false;
  }, []);

  const dropTime = upcomingTimes(park.dropTimes)[0];

  return (
    <Tab
      title="Genie+"
      buttons={
        <>
          <SortSelect />
          <ParkSelect />
          <RefreshButton name="Experiences" onClick={refreshExperiences} />
        </>
      }
      subhead={
        <>
          <RebookingHeader />
          <TimeBanner bookTime={client.nextBookTime} dropTime={dropTime} />
        </>
      }
      contentRef={contentRef}
    >
      <Experiences
        experiences={experiences}
        park={park}
        dropTime={dropTime}
        sorter={sorter}
      />
      {loaderElem}
    </Tab>
  );
}

const Experiences = memo(function Experiences({
  experiences,
  park,
  dropTime,
  sorter,
}: {
  experiences: Experience[];
  park: Park;
  sorter: Sorter;
  dropTime?: string;
}) {
  const { goTo } = useNav();
  const theme = useTheme();
  const [starred, setStarred] = useState<Set<string>>(() => {
    const ids = kvdb.get<string[]>(STARRED_KEY) ?? [];
    return new Set(Array.isArray(ids) ? ids : []);
  });
  const nowMinutes = timeToMinutes(dateTimeStrings().time);

  function toggleStar({ id }: { id: string }) {
    setStarred(starred => {
      starred = new Set(starred);
      if (starred.has(id)) {
        starred.delete(id);
      } else {
        starred.add(id);
      }
      kvdb.set<string[]>(STARRED_KEY, [...starred]);
      return starred;
    });
  }

  const showLightningPickDesc = () => goTo(<LightningPickDesc />);
  const showDropTimeDesc = (exp?: Experience) =>
    goTo(<DropTimeDesc park={park} experience={exp} />);
  const showBookedDesc = () => goTo(<BookedDesc />);

  const ExperienceList = ({
    experiences,
    type,
  }: {
    experiences: PlusExperience[];
    type: string;
  }) => (
    <ul data-testid={type}>
      {experiences.map(exp => {
        const [nextDropTime] = upcomingTimes(exp.dropTimes ?? []);
        return (
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
              ) : nextDropTime ? (
                <InfoButton
                  name={UPCOMING_DROP}
                  icon={DropIcon}
                  onClick={() => showDropTimeDesc(exp)}
                  className={nextDropTime !== dropTime ? 'opacity-50' : ''}
                />
              ) : null}
              {exp.flex.preexistingPlan && (
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
      })}
    </ul>
  );

  const plusExps = experiences
    .filter((exp): exp is PlusExperience => !!exp.flex)
    .map(exp => {
      const standby = exp.standby.waitTime || 0;
      const returnTime = exp?.flex?.nextAvailableTime;
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
    <>
      <ExperienceList experiences={unexperienced} type="unexperienced" />
      {experienced.length > 0 && (
        <>
          <h2
            className={`-mx-3 px-3 py-1 text-sm uppercase text-center ${theme.bg} text-white`}
          >
            Previously Experienced
          </h2>
          <ExperienceList experiences={experienced} type="experienced" />
        </>
      )}
      {(unexperienced.length > 0 || experienced.length > 0) && (
        <Legend>
          <Symbol
            sym={<LightningIcon className={theme.text} />}
            def={LIGHTNING_PICK}
            onInfo={showLightningPickDesc}
          />
          {park.dropTimes.length > 0 && (
            <Symbol
              sym={<DropIcon className={theme.text} />}
              def={UPCOMING_DROP}
              onInfo={showDropTimeDesc}
            />
          )}
          <Symbol
            sym={<CheckmarkIcon className={theme.text} />}
            def={BOOKED}
            onInfo={showBookedDesc}
          />
        </Legend>
      )}
    </>
  );
});

function InfoButton({
  name,
  icon: Icon,
  onClick,
  className,
}: {
  name: string;
  icon: React.FunctionComponent;
  onClick: () => void;
  className?: string;
}) {
  const theme = useTheme();
  return (
    <button
      title={`${name} (more info)`}
      className={`-mx-2 px-2 ${theme.text} ${className}`}
      onClick={onClick}
    >
      <Icon />
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
    <Screen title={LIGHTNING_PICK}>
      <p>
        When an attraction with a long standby wait has a Lightning Lane return
        time in the near future, it's highlighted as a Lightning Pick. Book
        these quick before they're gone!
      </p>
    </Screen>
  );
}

function DropTimeDesc({
  park,
  experience,
}: {
  park: Park;
  experience?: Experience;
}) {
  const resort = useResort();
  const dropTime = upcomingTimes(experience?.dropTimes ?? [])[0];
  const parks = resort.parks
    .filter(p => p.dropTimes.length > 0)
    .sort((a, b) => (a === park ? -1 : b === park ? 1 : 0));
  return (
    <Screen title={UPCOMING_DROP}>
      <p>
        {experience ? <b>{experience.name}</b> : 'This attraction'} may be part
        of{' '}
        {dropTime ? (
          <>
            the{' '}
            <time dateTime={dropTime} className="font-semibold">
              {displayTime(dropTime)}
            </time>
          </>
        ) : (
          <>an upcoming</>
        )}{' '}
        drop of additional Lightning Lane inventory, with earlier return times
        than what's currently being offered. Availability varies but is always
        limited, so be sure you're ready to book when the drop time arrives!
      </p>
      {parks.map(park => {
        const [nextDropTime] = upcomingTimes(park.dropTimes);
        return (
          <div
            className={`mt-5 rounded overflow-hidden ${park.theme.bg}`}
            key={park.id}
          >
            <h2
              className={`mt-0 py-1 ${park.theme.bg} text-white text-base text-center`}
            >
              {park.name}
            </h2>
            <div className="flex flex-col px-2 pb-3 bg-white bg-opacity-90">
              {resort.dropExperiences(park).map((exp, i) => {
                const isExp = i === 1 && park.name === 'Hollywood Studios';
                const upcoming = new Set(upcomingTimes(exp.dropTimes ?? []));
                return (
                  <div key={exp.id}>
                    <h3
                      className={`mt-3 text-base ${isExp ? `${park.theme.text}font-bold` : ''}`}
                    >
                      {exp.name}
                    </h3>
                    <ul className="flex flex-wrap gap-y-2 mt-1 leading-tight">
                      {exp.dropTimes?.map(time => {
                        const isNextDrop = time === nextDropTime;
                        return (
                          <li className="min-w-[6em] text-center" key={time}>
                            <div
                              className={`${isNextDrop ? `${park.theme.text} font-bold` : upcoming.has(time) ? 'font-semibold' : 'text-gray-500'}`}
                            >
                              <time dateTime={time}>{displayTime(time)}</time>
                            </div>
                            {isNextDrop ? (
                              <div
                                className={`rounded-sm ${park.theme.bg} text-white text-opacity-90 text-xs font-semibold text-center uppercase`}
                              >
                                next
                              </div>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </Screen>
  );
}

function BookedDesc() {
  return (
    <Screen title={BOOKED}>
      <p>
        You currently have a Lightning Lane reservation for this attraction.
      </p>
    </Screen>
  );
}
