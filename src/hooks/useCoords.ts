import { useCallback, useState } from 'react';

import { geolocate } from '@/geolocate';

const DEFAULT_OPTIONS = { maximumAge: 15_000, timeout: 2000 };

export type Coords = readonly [number, number];

export default function useCoords(): [typeof coords, typeof updateCoords] {
  const [coords, setCoords] = useState<Coords>();

  const updateCoords = useCallback(() => {
    (async () => {
      try {
        const { coords } = await geolocate(DEFAULT_OPTIONS);
        setCoords(prev =>
          prev && coords.latitude === prev[0] && coords.longitude === prev[1]
            ? prev
            : [coords.latitude, coords.longitude]
        );
      } catch {
        setCoords(undefined);
      }
    })();
  }, []);

  return [coords, updateCoords];
}
