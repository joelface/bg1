import { Booking, Park } from '@/api/genie';
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
  const parksByDate = new Map<string, Set<Park>>();
  for (const plan of plans) {
    const date = plan.start.date ?? today;
    if (!plansByDate.has(date)) plansByDate.set(date, []);
    if (plan.type !== 'APR') plansByDate.get(date)?.push(plan);
    if (!parksByDate.has(date)) parksByDate.set(date, new Set());
    if ((plan.type !== 'LL' || plan.subtype !== 'MEP') && plan.park.icon) {
      parksByDate.get(date)?.add(plan.park as Park);
    }
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
            <div className={`sticky top-0 -mx-3 pt-1 bg-white`}>
              <div className="flex items-center">
                <h2
                  className={`flex-1 mt-0 rounded-r-full px-3 py-1 ${theme.bg} text-white text-sm uppercase`}
                >
                  <Time date={date} />
                </h2>
                <ul className="px-3 pl-2 text-lg text-right">
                  {[...(parksByDate.get(date) ?? [])].map(park => (
                    <li
                      key={park.id}
                      className="inline ml-1 first:ml-0"
                      aria-label={park.name}
                    >
                      {park.icon}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <ul className={plans.length === 0 ? 'mt-3' : ''}>
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
