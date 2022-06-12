import { useCallback, useEffect, useRef, useState } from 'react';

import { Booking, Park, PlusExperience } from '/api/genie';
import { useGenieClient } from '/contexts/GenieClient';
import { Rebooking, RebookingProvider } from '/contexts/Rebooking';
import { useTheme } from '/contexts/Theme';
import { dateTimeStrings } from '/datetime';
import useDataLoader from '/hooks/useDataLoader';
import LightningIcon from '/icons/LightningIcon';
import RefreshIcon from '/icons/RefreshIcon';
import StarIcon from '/icons/StarIcon';
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

const AUTO_REFRESH_MIN_MS = 60_000;
const PARK_KEY = 'bg1.genie.tipBoard.park';
const STARRED_KEY = 'bg1.genie.tipBoard.starred';

type ExperienceSorter = (a: PlusExperience, b: PlusExperience) => number;

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

const sorters: { [key: string]: ExperienceSorter } = {
  priority: (a, b) =>
    sortByPriority(a, b) || sortByStandby(a, b) || sortBySoonest(a, b),
  standby: (a, b) => sortByStandby(a, b) || sortBySoonest(a, b),
  soonest: (a, b) => sortBySoonest(a, b) || sortByStandby(a, b),
  aToZ: () => 0,
};

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
  const [experiences, setExperiences] = useState<PlusExperience[]>([]);
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

  const refresh = useCallback(
    (force: unknown = true) => {
      setLastRefresh(lastRefresh => {
        if (!force && Date.now() - lastRefresh < AUTO_REFRESH_MIN_MS) {
          return lastRefresh;
        }
        loadData(async () =>
          setExperiences(await client.plusExperiences(park))
        );
        return Date.now();
      });
    },
    [client, park, loadData]
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
                  +b.flex.available - +a.flex.available ||
                  +starred.has(b.id) - +starred.has(a.id) ||
                  sorters[sortType](a, b) ||
                  sortByName(a, b)
              )
              .map(exp => (
                <li
                  className="pb-3 first:border-0 border-t-4 border-gray-300"
                  key={exp.id + (starred.has(exp.id) ? '*' : '')}
                >
                  <div className="flex items-center">
                    <StarButton
                      experience={exp}
                      starred={starred}
                      onClick={toggleStar}
                    />
                    <h2 className="mt-2 text-lg leading-tight truncate">
                      {exp.name}
                    </h2>
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
    <div className="relative w-6 h-8">
      <button
        data-id={experience.id}
        title="Favorite"
        className="absolute top-0 -left-2 p-2"
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
