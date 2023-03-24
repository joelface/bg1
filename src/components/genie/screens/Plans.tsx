import { Booking } from '@/api/genie';
import Tab from '@/components/Tab';
import { Time } from '@/components/Time';
import { useNav } from '@/contexts/Nav';
import { usePlans } from '@/contexts/Plans';
import { DEFAULT_THEME, useTheme } from '@/contexts/Theme';
import { dateTimeStrings } from '@/datetime';
import ChevronRightIcon from '@/icons/ChevronRightIcon';

import { ScreenProps } from '../../Screen';
import BookingListing from '../BookingListing';
import BookingDetails from './BookingDetails';
import RefreshButton from './RefreshButton';

export default function Plans({ ...props }: Partial<ScreenProps>) {
  const { plans, refreshPlans, loaderElem } = usePlans();
  const { goTo } = useNav();
  const theme = useTheme();

  function showBooking(booking: Booking) {
    goTo(<BookingDetails booking={booking} />);
  }

  const today = dateTimeStrings().date;
  const plansByDate = new Map<string, Booking[]>();
  for (const plan of plans) {
    const date = plan.start.date ?? today;
    const datePlans = plansByDate.get(date) ?? [];
    datePlans.push(plan);
    plansByDate.set(date, datePlans);
  }

  return (
    <Tab
      heading="Your Plans"
      buttons={<RefreshButton name="Plans" onClick={refreshPlans} />}
      theme={DEFAULT_THEME}
      {...props}
    >
      {plans.length > 0 ? (
        [...plansByDate].map(([date, plans]) => (
          <div key={date}>
            <h2
              className={`sticky top-0 mt-0 -mx-3 px-2 py-1 ${theme.bg} text-white text-sm text-center uppercase`}
            >
              <Time date={date} />
            </h2>
            <ul>
              {plans.map(booking => (
                <li
                  className="py-3 first:border-0 border-t-4 border-gray-300"
                  key={booking.bookingId}
                  onClick={() => showBooking(booking)}
                >
                  <BookingListing
                    booking={booking}
                    button={
                      <button className={theme.text} title="More Info">
                        <ChevronRightIcon />
                      </button>
                    }
                  />
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p className="font-semibold text-center uppercase text-gray-500">
          No existing plans
        </p>
      )}
      {loaderElem}
    </Tab>
  );
}
