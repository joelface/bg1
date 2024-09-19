import { createContext, useContext, useState } from 'react';

import { LightningLane } from '@/api/genie';

import { useBookingDate } from './BookingDate';

export interface Rebooking {
  current: LightningLane | undefined;
  begin: (booking: LightningLane) => void;
  end: () => void;
  prevBookingDate?: string;
}

export const RebookingContext = createContext<Rebooking>({
  current: undefined,
  begin: () => undefined,
  end: () => undefined,
});
export const useRebooking = () => useContext(RebookingContext);

export function RebookingProvider({
  children,
  current,
}: {
  children: React.ReactNode;
  current?: LightningLane;
}) {
  const { setBookingDate } = useBookingDate();
  const [rebooking, setRebooking] = useState<Rebooking>(() => ({
    current,
    begin: (booking: LightningLane) => {
      setBookingDate(date => {
        setRebooking({ ...rebooking, current: booking, prevBookingDate: date });
        return booking.start.date;
      });
    },
    end: () => {
      setRebooking(rebooking => {
        if (rebooking.prevBookingDate) {
          setBookingDate(rebooking.prevBookingDate);
        }
        return { ...rebooking, current: undefined, prevBookingDate: undefined };
      });
    },
  }));
  return (
    <RebookingContext.Provider value={rebooking}>
      {children}
    </RebookingContext.Provider>
  );
}
