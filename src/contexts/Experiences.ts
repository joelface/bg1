import { useCallback, useEffect, useState } from 'react';

import { Experience } from '@/api/genie';
import { createContext } from '@/context';
import { useGenieClient } from '@/contexts/GenieClient';
import useDataLoader from '@/hooks/useDataLoader';
import useThrottleable from '@/hooks/useThrottleable';

import { usePark } from './Park';

interface ExperiencesState {
  experiences: Experience[];
  refreshExperiences: ReturnType<typeof useThrottleable>;
  loaderElem: ReturnType<typeof useDataLoader>['loaderElem'];
}

export const [ExperiencesProvider, useExperiences] =
  createContext<ExperiencesState>({
    experiences: [],
    refreshExperiences: () => undefined,
    loaderElem: null,
  });

export function useExperiencesState() {
  const client = useGenieClient();
  const { park } = usePark();
  const { loadData, loaderElem } = useDataLoader();
  const [experiences, setExperiences] = useState<Experience[]>([]);

  const refreshExperiences = useThrottleable(
    useCallback(() => {
      loadData(async () => {
        setExperiences(await client.experiences(park));
      });
    }, [park, client, loadData])
  );

  useEffect(refreshExperiences, [refreshExperiences]);

  useEffect(() => setExperiences([]), [park]);

  return { experiences, refreshExperiences, loaderElem };
}
