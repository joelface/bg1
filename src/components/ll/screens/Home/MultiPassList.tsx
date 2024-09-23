import { memo, useEffect, useRef, useState } from 'react';

import { isType } from '@/api/itinerary';
import { Experience, FlexExperience } from '@/api/ll';
import { Park } from '@/api/resort';
import Screen from '@/components/Screen';
import Tab from '@/components/Tab';
import { useBookingDate } from '@/contexts/BookingDate';
import { useClients } from '@/contexts/Clients';
import { useExperiences } from '@/contexts/Experiences';
import { useNav } from '@/contexts/Nav';
import { usePark } from '@/contexts/Park';
import { usePlans } from '@/contexts/Plans';
import { useResort } from '@/contexts/Resort';
import { useTheme } from '@/contexts/Theme';
import {
  DateTime,
  displayTime,
  parkDate,
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
import BookingDateSelect from './BookingDateSelect';
import LLButton from './LLButton';
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

export interface ExtFlexExp extends FlexExperience {
  booked: boolean;
  lp: boolean;
  starred: boolean;
}

const isExperienced = (exp: ExtFlexExp) => exp.experienced && !exp.starred;

export default function MultiPassList({ contentRef }: HomeTabProps) {
  useSelectedParty();
  const { ll } = useClients();
  const { park } = usePark();
  const { experiences, refreshExperiences, loaderElem } = useExperiences();
  const { bookingDate } = useBookingDate();
  const { sortType, sorter, SortSelect } = useSort();
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (!firstUpdate.current) contentRef.current?.scroll(0, 0);
  }, [sortType, contentRef]);

  useEffect(() => {
    firstUpdate.current = false;
  }, []);

  const today = parkDate();
  const dropTime = upcomingTimes(park.dropTimes)[0];

  return (
    <Tab
      title={<abbr title="Lightning Lane">LL</abbr>}
      buttons={
        <>
          {ll.rules.prebook && <BookingDateSelect />}
          <SortSelect />
          <ParkSelect />
          <RefreshButton name="Experiences" onClick={refreshExperiences} />
        </>
      }
      subhead={
        <>
          <RebookingHeader />
          {bookingDate === today && (
            <TimeBanner bookTime={ll.nextBookTime} dropTime={dropTime} />
          )}
        </>
      }
      contentRef={contentRef}
    >
      <Experiences experiences={experiences} park={park} sorter={sorter} />
      {loaderElem}
    </Tab>
  );
}

const Experiences = memo(function Experiences({
  experiences,
  park,
  sorter,
}: {
  experiences: Experience[];
  park: Park;
  sorter: Sorter;
}) {
  const { goTo } = useNav();
  const theme = useTheme();
  const resort = useResort();
  const { plans } = usePlans();
  const { bookingDate } = useBookingDate();
  const [starred, setStarred] = useState<Set<string>>(() => {
    const ids = kvdb.get<string[]>(STARRED_KEY) ?? [];
    return new Set(Array.isArray(ids) ? ids : []);
  });
  const today = parkDate();
  const isBookingToday = bookingDate === today;
  const dropTime = isBookingToday
    ? upcomingTimes(park.dropTimes)[0]
    : park.dropTimes[0];
  const nowMinutes = timeToMinutes(new DateTime().time);

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
    goTo(
      <DropTimeDesc
        park={park}
        experience={exp}
        isBookingToday={isBookingToday}
      />
    );
  const showBookedDesc = () => goTo(<BookedDesc />);

  const ExperienceList = ({
    experiences,
    type,
  }: {
    experiences: ExtFlexExp[];
    type: string;
  }) => (
    <ul data-testid={type}>
      {experiences.map(exp => {
        const nextDropTime = isBookingToday
          ? upcomingTimes(exp.dropTimes ?? [])[0]
          : exp.dropTimes
            ? dropTime
            : null;
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
              {exp.booked && (
                <InfoButton
                  name={BOOKED}
                  icon={CheckmarkIcon}
                  onClick={showBookedDesc}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <StandbyTime experience={exp} average={!isBookingToday} />
              <LLButton experience={exp} />
            </div>
          </li>
        );
      })}
    </ul>
  );

  const bookedIds = new Set(
    plans
      .filter(b => isType(b, 'LL', 'MP') && b.start.date === bookingDate)
      .map(b => b.id)
  );
  const flexExps: ExtFlexExp[] = experiences
    .filter((exp): exp is FlexExperience => !!exp.flex)
    .map(exp => {
      const standby = exp.standby.waitTime || 0;
      const { nextAvailableTime } = exp.flex ?? {};
      const priorityLevel = Math.trunc(exp.priority || 4);
      return {
        ...exp,
        booked: bookedIds.has(exp.id),
        lp:
          isBookingToday &&
          !!nextAvailableTime &&
          standby >= LP_MIN_STANDBY &&
          priorityLevel < 3 &&
          timeToMinutes(nextAvailableTime) - nowMinutes <=
            Math.min(LP_MAX_LL_WAIT, ((4 - priorityLevel) / 3) * standby),
        starred: starred.has(exp.id),
      };
    })
    .sort(
      (a, b) => +!a.starred - +!b.starred || +!a.lp - +!b.lp || sorter(a, b)
    );
  const unexperienced = flexExps.filter(exp => !isExperienced(exp));
  const experienced = flexExps
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
            Experienced or Expired
          </h2>
          <ExperienceList experiences={experienced} type="experienced" />
        </>
      )}
      {flexExps.length > 0 && (
        <>
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
          {!isBookingToday && (
            <p className="text-sm">
              Standby times for future dates are monthly averages (source:{' '}
              <a
                href={`https://www.thrill-data.com/waits/park/${resort.id.toLowerCase()}/${park.name.toLowerCase().replaceAll(' ', '-')}/`}
                target="_blank"
                rel="noreferrer"
                className="whitespace-nowrap"
              >
                Thrill Data
              </a>
              ) meant to assist you in selecting your initial{' '}
              <abbr title="Lightning Lanes">LLs</abbr>. They are not wait time
              estimates for this particular day.
            </p>
          )}
        </>
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
  experience: ExtFlexExp;
  toggleStar: (exp: ExtFlexExp) => void;
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
  isBookingToday,
}: {
  park: Park;
  experience?: Experience;
  isBookingToday?: boolean;
}) {
  const resort = useResort();
  const dropTime = upcomingTimes(experience?.dropTimes ?? [])[0];
  const parks = resort.parks
    .filter(p => p.dropTimes.length > 0)
    .sort((a, b) => (a === park ? -1 : b === park ? 1 : 0));
  return (
    <Screen title={UPCOMING_DROP}>
      <p>
        {experience ? <b>{experience.name}</b> : <>This attraction</>} may be
        part of{' '}
        {!isBookingToday ? (
          <>a day-of</>
        ) : dropTime ? (
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
              {resort.dropExperiences(park).map(exp => {
                const upcoming = new Set(upcomingTimes(exp.dropTimes ?? []));
                return (
                  <div key={exp.id}>
                    <h3 className="mt-3">{exp.name}</h3>
                    <ul className="flex flex-wrap gap-y-2 mt-1 leading-tight">
                      {exp.dropTimes?.map(time => {
                        const isNextDrop =
                          isBookingToday && time === nextDropTime;
                        return (
                          <li className="min-w-[6em] text-center" key={time}>
                            <div
                              className={`${isNextDrop ? `${park.theme.text} font-bold` : upcoming.has(time) || !isBookingToday ? 'font-semibold' : 'text-gray-500'}`}
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
