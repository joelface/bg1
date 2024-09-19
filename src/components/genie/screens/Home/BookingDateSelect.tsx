import { useMemo } from 'react';

import MenuButton, { MenuProps } from '@/components/MenuButton';
import { getBookingDates, useBookingDate } from '@/contexts/BookingDate';
import { useTheme } from '@/contexts/Theme';
import { DateFormat, dateObject, modifyDate, parkDate } from '@/datetime';

export default function BookingDateSelect(props: { className?: string }) {
  const { bookingDate, setBookingDate } = useBookingDate();
  const today = parkDate();

  const options = useMemo(() => {
    return new Map(
      getBookingDates().map(date => {
        const [, m, d] = date.split('-');
        const buttonText = date === today ? 'Today' : `${+m}/${+d}`;
        const text = String(+d);
        return [date, { buttonText, text }];
      })
    );
  }, [today]);

  return (
    <MenuButton
      {...props}
      title="Booking Date"
      options={options}
      selected={bookingDate}
      onChange={setBookingDate}
      menuType={CalendarMenu}
    />
  );
}

function CalendarMenu<K extends string, V>(props: MenuProps<K, V>) {
  const { bg } = useTheme();
  const { options, selected } = props;
  const dates = [...options.keys()];
  const bookStart = dateObject(dates[0]);
  const calStart = modifyDate(bookStart, -bookStart.getDay());
  const monthFmt = new DateFormat({ month: 'long' });
  const startMonth = monthFmt.format(bookStart);
  const endMonth = monthFmt.format(dates[dates.length - 1]);
  const numWeeks = Math.ceil(options.size / 7);

  return (
    <div className="px-1 pb-1">
      <h4 className="mt-3 text-lg text-center">
        {startMonth === endMonth ? (
          startMonth
        ) : (
          <>
            {startMonth} – {endMonth}
          </>
        )}
      </h4>
      <table className="table-fixed border-separate border-spacing-[2px] w-full mt-2 font-semibold">
        <thead>
          <tr>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <th
                className="text-xs font-semibold uppercase text-center text-gray-500"
                key={d}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(numWeeks).keys()].map(weekIdx => (
            <tr key={weekIdx}>
              {[...Array(7).keys()].map(dayIdx => {
                const date = modifyDate(calStart, weekIdx * 7 + dayIdx);
                const opt = options.get(date as K);
                return opt ? (
                  <td className="p-0" key={dayIdx}>
                    <label className={`block p-2 ${bg} text-white`}>
                      <span
                        className={`flex items-center justify-center border-y-4 border-transparent has-[:checked]:border-white py-0.5`}
                      >
                        <input
                          type="radio"
                          name="bookingDate"
                          value={date}
                          defaultChecked={date === selected}
                          className="fixed opacity-0 pointer-events-none"
                        />
                        <time dateTime={date}>{opt.text}</time>
                      </span>
                    </label>
                  </td>
                ) : (
                  <td key={dayIdx} />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
