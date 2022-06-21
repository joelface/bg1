import { useCallback, useEffect, useRef, useState } from 'react';

import { Booking, Park, PlusExperience } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import { Rebooking, RebookingProvider } from '@/contexts/Rebooking';
import { useTheme } from '@/contexts/Theme';
import { dateTimeStrings } from '@/datetime';
import useDataLoader from '@/hooks/useDataLoader';
import LightningIcon from '@/icons/LightningIcon';
import RefreshIcon from '@/icons/RefreshIcon';
import StarIcon from '@/icons/StarIcon';
import Button from '../Button';
import LogoutButton from '../LogoutButton';
import Page from '../Page';
import Select from '../Select';
import BookExperience from './BookExperience';
import BookingPanel from './BookingPanel';
import GeniePlusButton from './GeniePlusButton';
import RebookingHeader from './RebookingHeader';
import StandbyTime from './StandbyTime';
import TimeBanner from './TimeBanner';
import useCoords, { Coords } from '@/hooks/useCoords';

const AUTO_REFRESH_MIN_MS = 60_000;
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

const sorters: { [key: string]: ExperienceSorter } = {
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

const LP_MIN_STANDBY = 30;
const LP_MAX_LL_WAIT = 60;

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
  const [experience, setExperience] = useState<PlusExperience>();
  const [bookingPanelOpen, setBookingPanelOpen] = useState(false);
  const [sortType, sort] = useState<keyof typeof sorters>('priority');
  const { loadData, loaderElem, isLoading } = useDataLoader();
  const [, setLastRefresh] = useState(0);
  const [rebooking, setRebooking] = useState<Rebooking>(() => ({
    current: null,
    begin: (booking: Booking) => {
      setRebooking({ ...rebooking, current: booking });
      setPark(booking.park);
      setBookingPanelOpen(false);
    },
    end: (canceled = false) => {
      setRebooking(rebooking =>
        rebooking.current ? { ...rebooking, current: null } : rebooking
      );
      if (canceled) setExperience(undefined);
    },
  }));
  const pageElem = useRef<HTMLDivElement>(null);
  const bookingStart =
    experiences.length > 0 && !experiences[0].flex.available
      ? experiences[0].flex.enrollmentStartTime
      : undefined;
  const pdt = experiences.length > 0 ? client.pdt(park) : undefined;
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
          const experiences = await client.plusExperiences(park);
          const nowMinutes = timeToMinutes(dateTimeStrings().time);
          setExperiences(
            experiences.map(exp => {
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
    if (isLoading || experience || bookingPanelOpen) return;
    const refreshIfVisible = () => {
      if (!document.hidden) refresh(false);
    };
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [experience, refresh, isLoading, bookingPanelOpen]);

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
            <Button
              onClick={() => setBookingPanelOpen(true)}
              title="Your Lightning Lanes"
            >
              <LightningIcon />
            </Button>

            <Select
              value={park.id}
              onChange={e => {
                setPark(
                  parks.find(p => p.id === e.currentTarget.value) as Park
                );
              }}
              title="Park"
            >
              {parks.map(p => (
                <option value={p.id} title={p.name} key={p.id}>
                  {p.abbr}
                </option>
              ))}
            </Select>

            <Select
              value={sortType}
              onChange={e => sort(e.currentTarget.value)}
              title="Sort By"
            >
              <option value="priority">Priority</option>
              <option value="nearby">Nearby</option>
              <option value="standby">Standby</option>
              <option value="soonest">Soonest</option>
              <option value="aToZ">A to Z</option>
            </Select>

            <Button onClick={refresh} title="Refresh Tip Board">
              <RefreshIcon />
            </Button>
          </>
        }
        containerRef={pageElem}
      >
        <div aria-hidden={!!(experience || bookingPanelOpen)}>
          <RebookingHeader />
          {bookingStart ? (
            <TimeBanner label="Booking start" time={bookingStart} />
          ) : pdt ? (
            <TimeBanner label="Next drop" time={pdt} />
          ) : null}
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
                    {exp.lp && (
                      <span title="Lightning Pick">
                        <LightningIcon
                          className={`text${park.theme.bg.slice(2)}`}
                        />
                      </span>
                    )}
                  </div>
                  {exp.flex.preexistingPlan ? (
                    <div className="mt-2 border-2 border-green-600 rounded p-1 text-sm uppercase font-semibold text-center text-green-600 bg-green-100">
                      Lightning Lane Booked
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <StandbyTime experience={exp} />
                    <GeniePlusButton experience={exp} onClick={setExperience} />
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
      {bookingPanelOpen && (
        <BookingPanel onClose={() => setBookingPanelOpen(false)} />
      )}
      {experience && (
        <BookExperience
          experience={experience}
          park={park}
          onClose={() => {
            refresh(false);
            setExperience(undefined);
          }}
        />
      )}
    </RebookingProvider>
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
    <div className="relative w-4 h-6">
      <button
        data-id={experience.id}
        title="Favorite"
        className="absolute -top-2 -left-2 p-2"
        onClick={onClick}
      >
        <StarIcon
          className={
            starred.has(experience.id)
              ? 'text' + theme.bg.slice(2)
              : 'text-gray-300'
          }
        />
      </button>
    </div>
  );
}
