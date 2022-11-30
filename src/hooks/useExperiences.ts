import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

import {
  Park,
  Experience as BaseExp,
  PlusExperience as BasePlusExp,
} from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import { dateTimeStrings } from '@/datetime';
import useCoords, { Coords } from './useCoords';
import useDataLoader from './useDataLoader';

const AUTO_REFRESH_MIN_MS = 60_000;
const LP_MIN_STANDBY = 30;
const LP_MAX_LL_WAIT = 60;
const STARRED_KEY = 'bg1.genie.tipBoard.starred';

interface ExperienceExtras {
  lp?: boolean;
  starred?: boolean;
}

export type Experience = BaseExp & ExperienceExtras;
export type PlusExperience = BasePlusExp & ExperienceExtras;

type Sorter = (a: Experience, b: Experience, coords?: Coords) => number;

const sortByLP: Sorter = (a, b) => +!a.lp - +!b.lp;

const sortByPriority: Sorter = (a, b) =>
  (a.priority || Infinity) - (b.priority || Infinity);

const sortBySort: Sorter = (a, b) =>
  (a.sort || Infinity) - (b.sort || Infinity);

const sortByStandby: Sorter = (a, b) =>
  (b.standby.waitTime || -1) - (a.standby.waitTime || -1);

const sortBySoonest: Sorter = (a, b) =>
  (a?.flex?.nextAvailableTime || '').localeCompare(
    b?.flex?.nextAvailableTime || ''
  );

const sortByName: Sorter = (a, b) =>
  a.name.toLowerCase().localeCompare(b.name.toLowerCase());

const sortByLand: Sorter = (a, b) => a.land.sort - b.land.sort;

const distance = (a: Coords, b: Coords) =>
  Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

const sortByNearby: Sorter = (a, b, coords) => {
  if (a.geo === b.geo) return 0;
  if (!a.geo) return 1;
  if (!b.geo) return -1;
  return coords ? distance(a.geo, coords) - distance(b.geo, coords) : 0;
};

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
  land: ((a, b) => sortByLand(a, b) || sortBySort(a, b)) as Sorter,
} as const;

export default function useExperiences<
  P extends boolean = false,
  E extends Experience = P extends true ? PlusExperience : Experience
>({
  park,
  sortType,
  plusOnly,
}: {
  park: Park;
  sortType: keyof typeof sorters;
  plusOnly: P;
}): {
  experiences: E[];
  refresh: (force?: unknown) => void;
  toggleStar: (exp: E) => void;
  isLoading: boolean;
  loaderElem: React.ReactNode;
} {
  const client = useGenieClient();
  const { loadData, loaderElem, isLoading } = useDataLoader();
  const [coords, updateCoords] = useCoords(loadData);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [{ refreshing }, setRefreshState] = useState({
    refreshing: false,
    lastRefresh: 0,
  });
  const [starred, setStarred] = useState(new Set<string>());

  useEffect(() => {
    client.updateTracker();
  }, [client]);

  const refresh = useCallback(
    (force: unknown = true) => {
      setRefreshState(state => {
        if (!force) {
          if (Date.now() - state.lastRefresh < AUTO_REFRESH_MIN_MS) {
            return state;
          }
          client.updateTracker();
        }
        return { refreshing: true, lastRefresh: state.lastRefresh };
      });
    },
    [client]
  );

  useLayoutEffect(() => {
    setExperiences([]);
    refresh(true);
  }, [park, refresh]);

  useLayoutEffect(() => {
    if (!refreshing) return;
    setRefreshState({ refreshing: false, lastRefresh: Date.now() });
    loadData(async () => {
      if (sortType === 'nearby') updateCoords();
      const exps = await client.experiences(park);
      const nowMinutes = timeToMinutes(dateTimeStrings().time);
      setExperiences(
        exps.map(exp => {
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
      );
    });
  }, [client, loadData, park, refreshing, sortType, starred, updateCoords]);

  useEffect(() => {
    if (sortType === 'nearby') updateCoords();
  }, [sortType, updateCoords]);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem(STARRED_KEY) || '[]');
      const starred = new Set<string>(ids);
      setStarred(starred);
      setExperiences(exps =>
        exps.map(exp => ({ ...exp, starred: starred.has(exp.id) }))
      );
    } catch (error) {
      console.error(error);
    }
  }, []);

  function toggleStar(exp: Experience) {
    const { id } = exp;
    exp.starred = !exp.starred;
    if (exp.starred) {
      starred.add(id);
    } else {
      starred.delete(id);
    }
    setStarred(new Set(starred));
    localStorage.setItem(STARRED_KEY, JSON.stringify([...starred]));
  }

  return {
    experiences: experiences
      .filter(
        (exp): exp is E =>
          (!plusOnly || !!exp.flex) &&
          (plusOnly ||
            exp.standby.available ||
            exp.standby.unavailableReason === 'TEMPORARILY_DOWN')
      )
      .sort(
        (a, b) =>
          (plusOnly &&
            (+!a.starred - +!b.starred ||
              Number(b?.flex?.available) - Number(a?.flex?.available))) ||
          sorters[
            sortType === 'nearby' && !(coords && inPark(park, coords))
              ? 'priority'
              : sortType
          ](a, b, coords) ||
          sortByName(a, b)
      ),
    refresh,
    toggleStar,
    isLoading,
    loaderElem,
  };
}
