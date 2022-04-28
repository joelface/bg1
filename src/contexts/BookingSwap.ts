import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

import { Booking } from '@/api/genie';

export interface BookingSwap {
  booking: Booking | null;
  begin: (booking: Booking) => void;
  end: () => void;
}

export const BookingSwapContext = createContext<BookingSwap>({
  booking: null,
  begin: () => null,
  end: () => null,
});
export const BookingSwapProvider = BookingSwapContext.Provider;
export const useBookingSwap = () => useContext(BookingSwapContext);
