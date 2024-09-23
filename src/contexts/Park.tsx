import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Booking, isType } from '@/api/itinerary';
import { InvalidId, Park } from '@/api/resort';
import { parkDate } from '@/datetime';
import kvdb from '@/kvdb';

import { useBookingDate } from './BookingDate';
import { usePlans } from './Plans';
import { useResort } from './Resort';

export const PARK_KEY = ['bg1', 'park'];

interface ParkState {
  park: Park;
  setPark: React.Dispatch<React.SetStateAction<Park>>;
}

export const ParkContext = createContext<ParkState>({
  park: {} as Park,
  setPark: () => undefined,
});
export const usePark = () => useContext(ParkContext);

export function useUpdateParkFromPlans() {
  const resort = useResort();
  const { setPark } = usePark();
  const { plans } = usePlans();
  return useCallback(
    (date: string) => {
      const today = parkDate();
      const isToday = date === today;
      const parkIds = new Set(resort.parks.map(p => p.id));
      const isInPark = (b: Booking) => parkIds.has(b.park.id);
      const isLLMP = (b: Booking) => isType(b, 'LL', 'MP');
      let park: Park | undefined = undefined;
      for (const b of plans) {
        const bookingParkDay = parkDate(b.start);
        if (bookingParkDay < date) continue;
        if (bookingParkDay > date) break;
        if (isLLMP(b)) {
          park = b.park;
          if (!isToday) break;
        }
        if (!park && isInPark(b)) park = b.park;
      }
      setPark(prevPark => park ?? (prevPark.id ? prevPark : resort.parks[0]));
    },
    [plans, resort, setPark]
  );
}

function ParkInitializer() {
  const { plansLoaded, loaderElem } = usePlans();
  const { bookingDate } = useBookingDate();
  const updateParkFromPlans = useUpdateParkFromPlans();

  useEffect(() => {
    if (plansLoaded) updateParkFromPlans(bookingDate);
  }, [plansLoaded, bookingDate, updateParkFromPlans]);

  return loaderElem;
}

export function ParkProvider({ children }: { children: React.ReactNode }) {
  const resort = useResort();
  const [park, setPark] = useState(() => {
    const id = kvdb.getDaily<string>(PARK_KEY);
    if (!id) return {} as Park;
    try {
      return resort.park(id);
    } catch (error) {
      if (!(error instanceof InvalidId)) console.error(error);
      return resort.parks[0];
    }
  });

  useEffect(() => {
    if (park.id) kvdb.setDaily(PARK_KEY, park.id);
  }, [park]);

  return (
    <ParkContext.Provider value={{ park, setPark }}>
      {park.id ? children : <ParkInitializer />}
    </ParkContext.Provider>
  );
}
