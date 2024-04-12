import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Park } from '@/api/data';
import { Experience } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import useDataLoader from '@/hooks/useDataLoader';
import useThrottleable from '@/hooks/useThrottleable';

import { useLiveDataClient } from './LiveDataClient';
import { usePark } from './Park';

interface ExperiencesState {
  experiences: Experience[];
  refreshExperiences: ReturnType<typeof useThrottleable>;
  park: Park;
  setPark: (park: Park) => void;
  loaderElem: ReturnType<typeof useDataLoader>['loaderElem'];
}

export const ExperiencesContext = createContext<ExperiencesState>({
  experiences: [],
  refreshExperiences: () => undefined,
  park: {} as Park,
  setPark: () => null,
  loaderElem: null,
});
export const ExperiencesProvider = ExperiencesContext.Provider;
export const useExperiences = () => useContext(ExperiencesContext);

export function useExperiencesState() {
  const genie = useGenieClient();
  const livedata = useLiveDataClient();
  const { park, setPark } = usePark();
  const { loadData, loaderElem } = useDataLoader();
  const [experiences, setExperiences] = useState<Experience[]>([]);

  const refreshExperiences = useThrottleable(
    useCallback(() => {
      loadData(async () => {
        const showsPromise = livedata.shows(park);
        let exps = {
          ...Object.fromEntries(
            (await genie.experiences(park)).map(exp => [exp.id, exp])
          ),
        };
        try {
          exps = { ...(await showsPromise), ...exps };
        } catch (error) {
          console.error(error);
        }
        setExperiences(Object.values(exps));
      });
    }, [park, genie, livedata, loadData])
  );

  useEffect(refreshExperiences, [refreshExperiences]);

  return {
    experiences,
    park,
    refreshExperiences,
    loaderElem,
    setPark: (park: Park) => {
      setPark(park);
      setExperiences([]);
    },
  };
}
