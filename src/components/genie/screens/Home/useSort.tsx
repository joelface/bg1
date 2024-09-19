import { useCallback, useEffect, useMemo, useState } from 'react';

import { FlexExperience } from '@/api/genie';
import { Park } from '@/api/resort';
import Select from '@/components/Select';
import { useBookingDate } from '@/contexts/BookingDate';
import { useExperiences } from '@/contexts/Experiences';
import { usePark } from '@/contexts/Park';
import { parkDate, timeToMinutes } from '@/datetime';
import useCoords, { Coords } from '@/hooks/useCoords';
import kvdb from '@/kvdb';

export const SORT_KEY = ['bg1', 'genie', 'sort'];

export type Sorter = (
  a: FlexExperience,
  b: FlexExperience,
  options?: { coords?: Coords; isToday?: boolean }
) => number;

const sortByPriority: Sorter = (a, b) =>
  (a.priority || Infinity) - (b.priority || Infinity) ||
  (b.avgWait || -1) - (a.avgWait || -1);

const sortByStandby: Sorter = (a, b, { isToday } = {}) =>
  isToday
    ? (b.standby.waitTime || -1) - (a.standby.waitTime || -1)
    : +!a.virtualQueue - +!b.virtualQueue ||
      (b.avgWait || -1) - (a.avgWait || -1);

const sortBySoonest: Sorter = (a, b) =>
  timeToMinutes(a?.flex?.nextAvailableTime || '00:00') -
  timeToMinutes(b?.flex?.nextAvailableTime || '00:00');

const sortByName: Sorter = (a, b) =>
  a.name.toLowerCase().localeCompare(b.name.toLowerCase());

const distance = (a: Coords, b: Coords) =>
  Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

const sortByNearby: Sorter = (a, b, { coords } = {}) => {
  if (a.geo === b.geo) return 0;
  if (!a.geo) return 1;
  if (!b.geo) return -1;
  return coords ? distance(a.geo, coords) - distance(b.geo, coords) : 0;
};

const sorters = {
  priority: sortByPriority,
  standby: sortByStandby,
  soonest: sortBySoonest,
  nearby: sortByNearby,
  aToZ: sortByName,
} as const;

type SortType = keyof typeof sorters;

function inPark(park: Park, coords: Coords) {
  const { n, s, e, w } = park.geo;
  const [lat, lon] = coords;
  return lat < n && lat > s && lon < e && lon > w;
}

export default function useSort() {
  const { park } = usePark();
  const { experiences } = useExperiences();
  const [coords, updateCoords] = useCoords();
  const { bookingDate } = useBookingDate();
  const isToday = bookingDate === parkDate();
  const sortOptions = useMemo(
    () =>
      new Map<SortType, { text: string }>([
        ['priority', { text: 'Priority' }],
        ...(isToday ? ([['nearby', { text: 'Nearby' }]] as const) : []),
        ['standby', { text: 'Standby' }],
        ['soonest', { text: 'Soonest' }],
        ['aToZ', { text: 'A to Z' }],
      ]),
    [isToday]
  );
  const [sortType, setSortType] = useState(() => {
    const type = kvdb.get<SortType>(SORT_KEY);
    return type && sortOptions.has(type) ? type : 'priority';
  });

  useEffect(() => {
    setSortType(sortType =>
      sortOptions.has(sortType) ? sortType : 'priority'
    );
  }, [sortOptions]);

  useEffect(() => {
    if (sortType === 'nearby') updateCoords();
  }, [experiences, sortType, updateCoords]);

  const sorter = useCallback(
    (a: FlexExperience, b: FlexExperience) =>
      Number(b?.flex?.available) - Number(a?.flex?.available) ||
      sorters[
        sortType === 'nearby' && !(coords && inPark(park, coords))
          ? 'priority'
          : sortType
      ](a, b, { coords, isToday }) ||
      sortByName(a, b),
    [coords, park, sortType, isToday]
  );

  const SortSelect = (props: { className?: string }) => (
    <Select
      {...props}
      options={sortOptions}
      selected={sortType as SortType}
      onChange={type => {
        setSortType(type);
        kvdb.set<SortType>(SORT_KEY, type);
      }}
      title="Sort By"
    />
  );

  return { sortType, sorter, SortSelect };
}
