import { useEffect, useMemo, useRef, useState } from 'react';

import { LightningLane, Park } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import { ParkProvider } from '@/contexts/Park';
import { Rebooking, RebookingProvider } from '@/contexts/Rebooking';
import { useTheme } from '@/contexts/Theme';
import { dateTimeStrings, displayTime } from '@/datetime';
import useExperiences, { Experience } from '@/hooks/useExperiences';
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
import YourDayButton from './YourDayButton';

const PARK_KEY = 'bg1.genie.tipBoard.park';

const sortOptions = [
  { value: 'priority', text: 'Priority' },
  { value: 'nearby', text: 'Nearby' },
  { value: 'standby', text: 'Standby' },
  { value: 'soonest', text: 'Soonest' },
  { value: 'aToZ', text: 'A to Z' },
] as const;

type SortType = typeof sortOptions[number]['value'];

const isBooked = (exp: Experience) => exp.booked && !exp.starred;

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
  const [sortType, sort] = useState<SortType>('priority');
  const {
    experiences,
    nextBookTime,
    refresh,
    toggleStar,
    isLoading,
    loaderElem,
  } = useExperiences({ park, sortType });
  const [modal, setModal] = useState<React.ReactNode>();
  const closeModal = () => setModal(undefined);
  const [rebooking, setRebooking] = useState<Rebooking>(() => ({
    current: null,
    begin: (booking: LightningLane) => {
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

  const expListItem = (exp: Experience) => (
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
                <DropTimeModal dropTime={dropTime} onClose={closeModal} />
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
  );

  const unbooked = experiences.filter(exp => !isBooked(exp));
  const booked = experiences
    .filter(isBooked)
    .sort((a, b) => a.name.localeCompare(b.name));
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
            <YourDayButton onOpen={setModal} onClose={closeModal} />

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
          <ul data-testid="unbooked">{unbooked.map(expListItem)}</ul>
          {booked.length > 0 && (
            <>
              <h2
                className={`-mx-3 px-3 py-1 text-sm uppercase text-center ${park.theme.bg} text-white`}
              >
                Previously Booked
              </h2>
              <ul data-testid="booked">{booked.map(expListItem)}</ul>
            </>
          )}

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
  toggleStar,
}: {
  experience: Experience;
  toggleStar: ReturnType<typeof useExperiences>['toggleStar'];
}) {
  const theme = useTheme();
  return (
    <button
      title="Favorite"
      className="-m-2 p-2"
      onClick={() => toggleStar(experience)}
    >
      <StarIcon className={experience.starred ? theme.text : 'text-gray-300'} />
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
