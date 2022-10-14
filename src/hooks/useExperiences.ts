import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Park, PlusExperience } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import { dateTimeStrings } from '@/datetime';
import useCoords, { Coords } from './useCoords';
import useDataLoader from './useDataLoader';

const AUTO_REFRESH_MIN_MS = 60_000;
const LP_MIN_STANDBY = 30;
const LP_MAX_LL_WAIT = 60;
const STARRED_KEY = 'bg1.genie.tipBoard.starred';

export type Experience = PlusExperience & { lp: boolean; starred: boolean };

type Sorter = (a: Experience, b: Experience, coords?: Coords) => number;

const sortByLP: Sorter = (a, b) => +b.lp - +a.lp;

const sortByPriority: Sorter = (a, b) =>
  (a.priority || Infinity) - (b.priority || Infinity);

const sortByStandby: Sorter = (a, b) =>
  (b.standby.waitTime || -1) - (a.standby.waitTime || -1);

const sortBySoonest: Sorter = (a, b) =>
  (a.flex.nextAvailableTime || '').localeCompare(
    b.flex.nextAvailableTime || ''
  );

const sortByName: Sorter = (a, b) =>
  a.name.toLowerCase().localeCompare(b.name.toLowerCase());

const distance = (a: Coords, b: Coords) =>
  Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

const sortByNearby: Sorter = (a, b, coords) =>
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

const sorters = {
  priority: ((a, b) =>
    sortByLP(a, b) ||
    sortByPriority(a, b) ||
    sortByStandby(a, b) ||
    sortBySoonest(a, b)) as Sorter,
  standby: ((a, b) => sortByStandby(a, b) || sortBySoonest(a, b)) as Sorter,
  soonest: ((a, b) => sortBySoonest(a, b) || sortByStandby(a, b)) as Sorter,
  nearby: ((a, b, coords) => sortByNearby(a, b, coords)) as Sorter,
  aToZ: (() => 0) as Sorter,
} as const;

export default function useExperiences({
  park,
  sortType,
}: {
  park: Park;
  sortType: keyof typeof sorters;
}) {
  const client = useGenieClient();
  const { loadData, loaderElem, isLoading } = useDataLoader();
  const [coords, updateCoords] = useCoords(loadData);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [nextBookTime, setNextBookTime] = useState<string>();
  const [{ refreshing }, setRefreshState] = useState({
    refreshing: false,
    lastRefresh: 0,
  });
  const [sorted, setSorted] = useState(true);
  const starred = useRef(new Set<string>());

  const refresh = useCallback((force: unknown = true) => {
    setRefreshState(state =>
      force || Date.now() - state.lastRefresh >= AUTO_REFRESH_MIN_MS
        ? { refreshing: true, lastRefresh: state.lastRefresh }
        : state
    );
  }, []);

  useEffect(() => refresh(true), [park, refresh]);

  useEffect(() => {
    if (!refreshing) return;
    setRefreshState({ refreshing: false, lastRefresh: Date.now() });
    loadData(async () => {
      if (sortType === 'nearby') updateCoords();
      const { plus, nextBookTime } = await client.experiences(park);
      setNextBookTime(nextBookTime);
      const nowMinutes = timeToMinutes(dateTimeStrings().time);
      setExperiences(
        plus.map(exp => {
          const standby = exp.standby.waitTime || 0;
          const returnTime = exp.flex.nextAvailableTime;
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
            starred: starred.current.has(exp.id),
          };
        })
      );
      setSorted(false);
    });
  }, [client, loadData, park, refreshing, sortType, updateCoords]);

  useEffect(() => {
    if (sortType === 'nearby') updateCoords();
  }, [sortType, updateCoords]);

  useEffect(() => setSorted(false), [coords, sortType]);

  useLayoutEffect(() => {
    if (sorted) return;
    setExperiences(exps => [
      ...exps.sort(
        (a, b) =>
          +b.starred - +a.starred ||
          +b.flex.available - +a.flex.available ||
          sorters[
            sortType === 'nearby' && !(coords && inPark(park, coords))
              ? 'priority'
              : sortType
          ](a, b, coords) ||
          sortByName(a, b)
      ),
    ]);
    setSorted(true);
  }, [sorted, park, coords, sortType]);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem(STARRED_KEY) || '[]');
      starred.current = new Set<string>(ids);
      setExperiences(exps =>
        exps.map(exp => ({ ...exp, starred: starred.current.has(exp.id) }))
      );
    } catch (error) {
      console.error(error);
    }
  }, []);

  function toggleStar(exp: Experience) {
    const { id } = exp;
    exp.starred = !exp.starred;
    if (exp.starred) {
      starred.current.add(id);
    } else {
      starred.current.delete(id);
    }
    localStorage.setItem(STARRED_KEY, JSON.stringify([...starred.current]));
    setSorted(false);
  }

  return {
    experiences,
    nextBookTime,
    refresh,
    toggleStar,
    isLoading,
    loaderElem,
  };
}
