import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Experience, Park } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import { dateTimeStrings } from '@/datetime';
import useDataLoader from '@/hooks/useDataLoader';
import useThrottleable from '@/hooks/useThrottleable';

const PARK_KEY = 'bg1.genie.park';

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
  setPark: () => undefined,
  loaderElem: null,
});
export const ExperiencesProvider = ExperiencesContext.Provider;
export const useExperiences = () => useContext(ExperiencesContext);

export function useExperiencesState() {
  const client = useGenieClient();
  const { loadData, loaderElem } = useDataLoader();
  const { parks } = client;
  const [park, setPark] = useState(() => {
    const { id = parks[0].id, date = '' } =
      JSON.parse(sessionStorage.getItem(PARK_KEY) || '{}') || {};
    return (
      (date === dateTimeStrings().date && parks.find(p => p.id === id)) ||
      parks[0]
    );
  });
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

  return {
    experiences,
    refreshExperiences,
    park,
    setPark,
    loaderElem,
  };
}
