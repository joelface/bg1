import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Booking, Park, PlusExperience } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import { ParkProvider } from '@/contexts/Park';
import { Rebooking, RebookingProvider } from '@/contexts/Rebooking';
import { useTheme } from '@/contexts/Theme';
import { dateTimeStrings, displayTime } from '@/datetime';
import useCoords, { Coords } from '@/hooks/useCoords';
import useDataLoader from '@/hooks/useDataLoader';
import DropIcon from '@/icons/DropIcon';
import LightningIcon from '@/icons/LightningIcon';
import RefreshIcon from '@/icons/RefreshIcon';
import StarIcon from '@/icons/StarIcon';
import Button from '../Button';
import LogoutButton from '../LogoutButton';
import Modal from '../Modal';
import Page from '../Page';
import Select from '../Select';
import BookExperience from './BookExperience';
import GeniePlusButton from './GeniePlusButton';
import RebookingHeader from './RebookingHeader';
import StandbyTime from './StandbyTime';
import TimeBanner from './TimeBanner';
import YLLButton from './YLLButton';

const AUTO_REFRESH_MIN_MS = 60_000;
const LP_MIN_STANDBY = 30;
const LP_MAX_LL_WAIT = 60;
const PARK_KEY = 'bg1.genie.tipBoard.park';
const STARRED_KEY = 'bg1.genie.tipBoard.starred';

type Experience = PlusExperience & { lp: boolean };

type ExperienceSorter = (
  a: Experience,
  b: Experience,
  coords?: Coords
) => number;

const sortByLP: ExperienceSorter = (a, b) => +b.lp - +a.lp;

const sortByPriority: ExperienceSorter = (a, b) =>
  (a.priority || Infinity) - (b.priority || Infinity);

const sortByStandby: ExperienceSorter = (a, b) =>
  (b.standby.waitTime || -1) - (a.standby.waitTime || -1);

const sortBySoonest: ExperienceSorter = (a, b) =>
  (a.flex.nextAvailableTime || '').localeCompare(
    b.flex.nextAvailableTime || ''
  );

const sortByName: ExperienceSorter = (a, b) =>
  a.name.toLowerCase().localeCompare(b.name.toLowerCase());

const distance = (a: Coords, b: Coords) =>
  Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

const sortByNearby: ExperienceSorter = (a, b, coords) =>
  coords ? distance(a.geo, coords) - distance(b.geo, coords) : 0;

function inPark(park: Park, coords: Coords) {
  const { n, s, e, w } = park.geo;
  const [lat, lon] = coords;
  return lat < n && lat > s && lon < e && lon > w;
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

const sorters: Record<string, ExperienceSorter> = {
  priority: (a, b) =>
    sortByLP(a, b) ||
    sortByPriority(a, b) ||
    sortByStandby(a, b) ||
    sortBySoonest(a, b),
  standby: (a, b) => sortByStandby(a, b) || sortBySoonest(a, b),
  soonest: (a, b) => sortBySoonest(a, b) || sortByStandby(a, b),
  nearby: (a, b, coords) => sortByNearby(a, b, coords),
  aToZ: () => 0,
};

const sortOptions = [
  { value: 'priority', text: 'Priority' },
  { value: 'nearby', text: 'Nearby' },
  { value: 'standby', text: 'Standby' },
  { value: 'soonest', text: 'Soonest' },
  { value: 'aToZ', text: 'A to Z' },
] as const;

type SortType = typeof sortOptions[number]['value'];

export default function TipBoard() {
  const client = useGenieClient();
  const { parks } = client;
  const [park, setPark] = useState(() => {
    const { id = parks[0].id, date = '' } =
      JSON.parse(sessionStorage.getItem(PARK_KEY) || '{}') || {};
    return (
      (date === dateTimeStrings().date && parks.find(p => p.id === id)) ||
      parks[0]
    );
  });
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [nextBookTime, setNextBookTime] = useState<string>();
  const [modal, setModal] = useState<React.ReactNode>();
  const closeModal = () => setModal(undefined);
  const [sortType, sort] = useState<SortType>('priority');
  const { loadData, loaderElem, isLoading } = useDataLoader();
  const [, setLastRefresh] = useState(0);
  const [rebooking, setRebooking] = useState<Rebooking>(() => ({
    current: null,
    begin: (booking: Booking) => {
      setRebooking({ ...rebooking, current: booking });
      setPark(booking.park);
      closeModal();
    },
    end: (canceled = false) => {
      setRebooking(rebooking =>
        rebooking.current ? { ...rebooking, current: null } : rebooking
      );
      if (canceled) closeModal();
    },
  }));
  const pageElem = useRef<HTMLDivElement>(null);
  const [starred, setStarred] = useState(() => {
    let starred = [];
    try {
      starred = JSON.parse(localStorage.getItem(STARRED_KEY) || '[]');
    } catch (error) {
      console.error(error);
    }
    return new Set<string>(starred);
  });
  const [coords, updateCoords] = useCoords(loadData);

  useEffect(() => {
    if (sortType === 'nearby') updateCoords();
  }, [sortType, updateCoords]);

  const refresh = useCallback(
    (force: unknown = true) => {
      setLastRefresh(lastRefresh => {
        if (!force && Date.now() - lastRefresh < AUTO_REFRESH_MIN_MS) {
          return lastRefresh;
        }
        loadData(async () => {
          sort(sortType => {
            if (sortType === 'nearby') updateCoords();
            return sortType;
          });
          const { plus, nextBookTime } = await client.experiences(park);
          setNextBookTime(nextBookTime);
          const nowMinutes = timeToMinutes(dateTimeStrings().time);
          setExperiences(
            plus.map(exp => {
              const standby = exp.standby.waitTime || 0;
              const returnTime = exp.flex.nextAvailableTime;
              if (!returnTime) return { ...exp, lp: false };
              const minutesUntilReturn = timeToMinutes(returnTime) - nowMinutes;
              return {
                ...exp,
                lp:
                  standby >= LP_MIN_STANDBY &&
                  minutesUntilReturn <=
                    Math.min(
                      LP_MAX_LL_WAIT,
                      ((4 - Math.trunc(exp.priority || 4)) / 3) * standby
                    ),
              };
            })
          );
        });
        return Date.now();
      });
    },
    [client, park, loadData, updateCoords]
  );

  useEffect(() => {
    setExperiences([]);
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (isLoading || modal) return;
    const refreshIfVisible = () => {
      if (!document.hidden) refresh(false);
    };
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [modal, refresh, isLoading]);

  useEffect(() => {
    pageElem.current?.scroll(0, 0);
  }, [park, sortType, rebooking]);

  useEffect(() => {
    sessionStorage.setItem(
      PARK_KEY,
      JSON.stringify({ id: park.id, date: dateTimeStrings().date })
    );
  }, [park]);

  function toggleStar(event: React.MouseEvent<HTMLButtonElement>) {
    const btn = event.currentTarget;
    const id = btn.getAttribute('data-id');
    if (!id) return;
    if (starred.has(id)) {
      starred.delete(id);
    } else {
      starred.add(id);
    }
    localStorage.setItem(STARRED_KEY, JSON.stringify([...starred]));
    setStarred(new Set([...starred]));
  }

  const parkOptions = useMemo(
    () =>
      parks.map(p => ({
        value: p.id,
        icon: p.icon,
        text: p.name,
      })),
    [parks]
  );

  const startTime = experiences?.[0]?.flex.enrollmentStartTime;
  const dropTime = client.nextDropTime(park);

  return (
    <RebookingProvider value={rebooking}>
      <Page
        heading={
          <>
            G<span className="hidden xs:inline">enie</span>+
          </>
        }
        theme={park.theme}
        buttons={
          <>
            <YLLButton onOpen={setModal} onClose={closeModal} />

            <Select
              options={parkOptions}
              value={park.id}
              onChange={id => setPark(parks.find(p => p.id === id) as Park)}
              title="Park"
            />

            <Select
              options={sortOptions}
              value={sortType}
              onChange={sort}
              title="Sort By"
            />

            <Button onClick={refresh} title="Refresh Tip Board">
              <RefreshIcon />
            </Button>
          </>
        }
        containerRef={pageElem}
      >
        <div aria-hidden={!!modal}>
          <RebookingHeader />
          <TimeBanner
            bookTime={startTime || nextBookTime}
            dropTime={dropTime}
          />
          <ul>
            {experiences
              .sort(
                (a, b) =>
                  +starred.has(b.id) - +starred.has(a.id) ||
                  +b.flex.available - +a.flex.available ||
                  sorters[
                    sortType === 'nearby' && !(coords && inPark(park, coords))
                      ? 'priority'
                      : sortType
                  ](a, b, coords) ||
                  sortByName(a, b)
              )
              .map(exp => (
                <li
                  className="pb-3 first:border-0 border-t-4 border-gray-300"
                  key={exp.id + (starred.has(exp.id) ? '*' : '')}
                >
                  <div className="flex items-center gap-x-2 mt-2">
                    <StarButton
                      experience={exp}
                      starred={starred}
                      onClick={toggleStar}
                    />
                    <h2 className="flex-1 mt-0 text-lg leading-tight truncate">
                      {exp.name}
                    </h2>
                    {exp.lp ? (
                      <InfoButton
                        name="Lightning Pick"
                        icon={LightningIcon}
                        onClick={() =>
                          setModal(<LightningPickModal onClose={closeModal} />)
                        }
                      />
                    ) : dropTime && exp.drop ? (
                      <InfoButton
                        name="Upcoming Drop"
                        icon={DropIcon}
                        onClick={() =>
                          setModal(
                            <DropTimeModal
                              dropTime={dropTime}
                              onClose={closeModal}
                            />
                          )
                        }
                      />
                    ) : null}
                  </div>
                  {exp.flex.preexistingPlan && (
                    <div className="mt-2 border-2 border-green-600 rounded p-1 text-sm uppercase font-semibold text-center text-green-600 bg-green-100">
                      Lightning Lane Booked
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <StandbyTime experience={exp} />
                    <GeniePlusButton
                      experience={exp}
                      onClick={experience =>
                        setModal(
                          <BookExperience
                            experience={experience}
                            onClose={() => {
                              closeModal();
                              refresh(false);
                            }}
                          />
                        )
                      }
                    />
                  </div>
                </li>
              ))}
          </ul>
          {!isLoading && (
            <div className="mt-12 text-center">
              <LogoutButton />
            </div>
          )}
          {loaderElem}
        </div>
      </Page>
      <ParkProvider value={park}>{modal}</ParkProvider>
    </RebookingProvider>
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
  starred,
  onClick,
}: {
  experience: PlusExperience;
  starred: Set<string>;
  onClick: React.MouseEventHandler;
}) {
  const theme = useTheme();
  return (
    <button
      data-id={experience.id}
      title="Favorite"
      className="-m-2 p-2"
      onClick={onClick}
    >
      <StarIcon
        className={starred.has(experience.id) ? theme.text : 'text-gray-300'}
      />
    </button>
  );
}

function LightningPickModal(props: { onClose: () => void }) {
  return (
    <Modal heading="Lightning Pick" {...props}>
      <p>
        When an attraction with a long wait has a Lightning Lane return time in
        the near future, it's highlighted as a Lightning Pick. Book these quick
        before they're gone!
      </p>
    </Modal>
  );
}

function DropTimeModal({
  dropTime,
  onClose,
}: {
  dropTime: string;
  onClose: () => void;
}) {
  return (
    <Modal heading="Upcoming Drop" onClose={onClose}>
      <p>
        This attraction may be part of the{' '}
        <time dateTime={dropTime} className="font-semibold">
          {displayTime(dropTime)}
        </time>{' '}
        drop of additional Lightning Lane inventory with earlier return times
        than what's currently being offered. Availability varies but is always
        limited, so be sure you're ready to book when the drop time arrives!
      </p>
    </Modal>
  );
}
