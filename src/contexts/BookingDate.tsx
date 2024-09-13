import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { modifyDate, parkDate } from '@/datetime';
import kvdb from '@/kvdb';

import { useClients } from './Clients';

export const BOOKING_DATE_KEY = ['bg1', 'date'];
const NUM_BOOKING_DAYS = 22;

interface BookingDateState {
  bookingDate: string;
  setBookingDate: React.Dispatch<React.SetStateAction<string>>;
}

export const BookingDateContext = createContext<BookingDateState>({
  bookingDate: parkDate(),
  setBookingDate: () => {},
});
export const useBookingDate = () => useContext(BookingDateContext);

export function getBookingDates() {
  const today = parkDate();
  return [...Array(NUM_BOOKING_DAYS).keys()].map(i => modifyDate(today, i));
}

function validDate(date: string | void) {
  return date && getBookingDates().includes(date) ? date : parkDate();
}

export function BookingDateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { prebook } = useClients().ll.rules;
  const [bookingDate, setDate] = useState(() => {
    return prebook
      ? validDate(kvdb.getDaily<string>(BOOKING_DATE_KEY))
      : parkDate();
  });

  const setBookingDate = useCallback(
    (date: Parameters<typeof setDate>[0]) => {
      setDate(prevDate => {
        date = typeof date === 'function' ? date(prevDate) : date;
        if (prebook) {
          date = validDate(date);
          kvdb.setDaily<string>(BOOKING_DATE_KEY, date);
          return date;
        } else {
          return parkDate();
        }
      });
    },
    [prebook, setDate]
  );

  useEffect(() => {
    kvdb.setDaily<string>(BOOKING_DATE_KEY, bookingDate);
  }, [bookingDate]);

  return (
    <BookingDateContext.Provider value={{ bookingDate, setBookingDate }}>
      {children}
    </BookingDateContext.Provider>
  );
}
