import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

import { Experience } from '@/api/genie';
import useDataLoader from '@/hooks/useDataLoader';
import useThrottleable from '@/hooks/useThrottleable';

import { useBookingDate } from './BookingDate';
import { useClients } from './Clients';
import { usePark } from './Park';

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
export const useExperiences = () => useContext(ExperiencesContext);

export function ExperiencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ll, liveData } = useClients();
  const { park } = usePark();
  const { bookingDate } = useBookingDate();
  const { loadData, loaderElem } = useDataLoader();
  const [experiences, setExperiences] = useState<Experience[]>([]);

  const refreshExperiences = useThrottleable(
    useCallback(() => {
      loadData(async () => {
        const showsPromise = liveData.shows(park);
        let exps = {
          ...Object.fromEntries(
            (await ll.experiences(park, bookingDate)).map(exp => [exp.id, exp])
          ),
        };
        try {
          exps = { ...(await showsPromise), ...exps };
        } catch (error) {
          console.error(error);
        }
        setExperiences(Object.values(exps));
      });
    }, [park, bookingDate, ll, liveData, loadData])
  );

  useLayoutEffect(() => setExperiences([]), [park, bookingDate]);

  useEffect(refreshExperiences, [refreshExperiences]);

  return (
    <ExperiencesContext.Provider
      value={{ experiences, refreshExperiences, loaderElem }}
    >
      {children}
    </ExperiencesContext.Provider>
  );
}
