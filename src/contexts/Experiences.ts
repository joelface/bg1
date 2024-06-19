import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Experience } from '@/api/genie';
import { Park } from '@/api/resort';
import useDataLoader from '@/hooks/useDataLoader';
import useThrottleable from '@/hooks/useThrottleable';

import { usePark } from './Park';
import { useResort } from './Resort';

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
  const { genie, liveData } = useResort();
  const { park, setPark } = usePark();
  const { loadData, loaderElem } = useDataLoader();
  const [experiences, setExperiences] = useState<Experience[]>([]);

  const refreshExperiences = useThrottleable(
    useCallback(() => {
      loadData(async () => {
        const showsPromise = liveData.shows(park);
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
    }, [park, genie, liveData, loadData])
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
