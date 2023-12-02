import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Experience } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import useDataLoader from '@/hooks/useDataLoader';
import useThrottleable from '@/hooks/useThrottleable';

import { usePark } from './Park';
import { useLiveDataClient } from './LiveDataClient';

interface ExperiencesState {
  experiences: Experience[];
  refreshExperiences: ReturnType<typeof useThrottleable>;
  loaderElem: ReturnType<typeof useDataLoader>['loaderElem'];
}

export const ExperiencesContext = createContext<ExperiencesState>({
  experiences: [],
  refreshExperiences: () => undefined,
  loaderElem: null,
});
export const ExperiencesProvider = ExperiencesContext.Provider;
export const useExperiences = () => useContext(ExperiencesContext);

export function useExperiencesState() {
  const genie = useGenieClient();
  const livedata = useLiveDataClient();
  const { park } = usePark();
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

  useEffect(() => setExperiences([]), [park]);

  return { experiences, refreshExperiences, loaderElem };
}
