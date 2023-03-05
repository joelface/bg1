import { useCallback, useEffect, useState } from 'react';

import { Park, PlusExperience } from '@/api/genie';
import Select from '@/components/Select';
import { useExperiences } from '@/contexts/Experiences';
import { timeToMinutes } from '@/datetime';
import useCoords, { Coords } from '@/hooks/useCoords';

type Sorter = (a: PlusExperience, b: PlusExperience, coords?: Coords) => number;

const sortByPriority: Sorter = (a, b) =>
  (a.priority || Infinity) - (b.priority || Infinity);

const sortByStandby: Sorter = (a, b) =>
  (b.standby.waitTime || -1) - (a.standby.waitTime || -1);

const sortBySoonest: Sorter = (a, b) =>
  timeToMinutes(a?.flex?.nextAvailableTime || '00:00') -
  timeToMinutes(b?.flex?.nextAvailableTime || '00:00');

const sortByName: Sorter = (a, b) =>
  a.name.toLowerCase().localeCompare(b.name.toLowerCase());

const distance = (a: Coords, b: Coords) =>
  Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

const sortByNearby: Sorter = (a, b, coords) => {
  if (a.geo === b.geo) return 0;
  if (!a.geo) return 1;
  if (!b.geo) return -1;
  return coords ? distance(a.geo, coords) - distance(b.geo, coords) : 0;
};

const sorters = {
  priority: ((a, b) =>
    sortByPriority(a, b) ||
    sortByStandby(a, b) ||
    sortBySoonest(a, b)) as Sorter,
  standby: ((a, b) => sortByStandby(a, b) || sortBySoonest(a, b)) as Sorter,
  soonest: ((a, b) => sortBySoonest(a, b) || sortByStandby(a, b)) as Sorter,
  nearby: ((a, b, coords) => sortByNearby(a, b, coords)) as Sorter,
  aToZ: (() => 0) as Sorter,
} as const;

type SortType = keyof typeof sorters;

const sortOptions = new Map<SortType, { text: string }>([
  ['priority', { text: 'Priority' }],
  ['nearby', { text: 'Nearby' }],
  ['standby', { text: 'Standby' }],
  ['soonest', { text: 'Soonest' }],
  ['aToZ', { text: 'A to Z' }],
]);

function inPark(park: Park, coords: Coords) {
  const { n, s, e, w } = park.geo;
  const [lat, lon] = coords;
  return lat < n && lat > s && lon < e && lon > w;
}

export default function useSort() {
  const { experiences, park } = useExperiences();
  const [coords, updateCoords] = useCoords();
  const [sortType, setSortType] = useState<SortType>('priority');

  useEffect(() => {
    if (sortType === 'nearby') updateCoords();
  }, [experiences, sortType, updateCoords]);

  const sorter = (a: PlusExperience, b: PlusExperience) =>
    Number(b?.flex?.available) - Number(a?.flex?.available) ||
    sorters[
      sortType === 'nearby' && !(coords && inPark(park, coords))
        ? 'priority'
        : sortType
    ](a, b, coords) ||
    sortByName(a, b);

  const SortSelect = useCallback(
    (props: { className?: string }) => (
      <Select
        {...props}
        options={sortOptions}
        selected={sortType}
        onChange={setSortType}
        title="Sort By"
      />
    ),
    [sortType]
  );

  return { sorter, SortSelect };
}
