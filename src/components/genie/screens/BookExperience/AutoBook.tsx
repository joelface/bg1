import { useState, useMemo, useEffect } from 'react';

import Button from '@/components/Button';
import Select from '@/components/Select';
import { getClosestTime, timeToDate } from '@/datetime';

const timeOptions = new Map<string, { text: string }>([
  ['07:00:00', { text: '7:00 AM' }],
  ['07:15:00', { text: '7:15 AM' }],
  ['07:30:00', { text: '7:30 AM' }],
  ['07:45:00', { text: '7:45 AM' }],
  ['08:00:00', { text: '8:00 AM' }],
  ['08:15:00', { text: '8:15 AM' }],
  ['08:30:00', { text: '8:30 AM' }],
  ['08:45:00', { text: '8:45 AM' }],
  ['09:00:00', { text: '9:00 AM' }],
  ['09:15:00', { text: '9:15 AM' }],
  ['09:30:00', { text: '9:30 AM' }],
  ['09:45:00', { text: '9:45 AM' }],
  ['10:00:00', { text: '10:00 AM' }],
  ['10:15:00', { text: '10:15 AM' }],
  ['10:30:00', { text: '10:30 AM' }],
  ['10:45:00', { text: '10:45 AM' }],
  ['11:00:00', { text: '11:00 AM' }],
  ['11:15:00', { text: '11:15 AM' }],
  ['11:30:00', { text: '11:30 AM' }],
  ['11:45:00', { text: '11:45 AM' }],
  ['12:00:00', { text: '12:00 PM' }],
  ['12:15:00', { text: '12:15 PM' }],
  ['12:30:00', { text: '12:30 PM' }],
  ['12:45:00', { text: '12:45 PM' }],
  ['13:00:00', { text: '1:00 PM' }],
  ['13:15:00', { text: '1:15 PM' }],
  ['13:30:00', { text: '1:30 PM' }],
  ['13:45:00', { text: '1:45 PM' }],
  ['14:00:00', { text: '2:00 PM' }],
  ['14:15:00', { text: '2:15 PM' }],
  ['14:30:00', { text: '2:30 PM' }],
  ['14:45:00', { text: '2:45 PM' }],
  ['15:00:00', { text: '3:00 PM' }],
  ['15:15:00', { text: '3:15 PM' }],
  ['15:30:00', { text: '3:30 PM' }],
  ['15:45:00', { text: '3:45 PM' }],
  ['16:00:00', { text: '4:00 PM' }],
  ['16:15:00', { text: '4:15 PM' }],
  ['16:30:00', { text: '4:30 PM' }],
  ['16:45:00', { text: '4:45 PM' }],
  ['17:00:00', { text: '5:00 PM' }],
  ['17:15:00', { text: '5:15 PM' }],
  ['17:30:00', { text: '5:30 PM' }],
  ['17:45:00', { text: '5:45 PM' }],
  ['18:00:00', { text: '6:00 PM' }],
  ['18:15:00', { text: '6:15 PM' }],
  ['18:30:00', { text: '6:30 PM' }],
  ['18:45:00', { text: '6:45 PM' }],
  ['19:00:00', { text: '7:00 PM' }],
  ['19:15:00', { text: '7:15 PM' }],
  ['19:30:00', { text: '7:30 PM' }],
  ['19:45:00', { text: '7:45 PM' }],
  ['20:00:00', { text: '8:00 PM' }],
  ['20:15:00', { text: '8:15 PM' }],
  ['20:30:00', { text: '8:30 PM' }],
  ['20:45:00', { text: '8:45 PM' }],
  ['21:00:00', { text: '9:00 PM' }],
  ['21:15:00', { text: '9:15 PM' }],
  ['21:30:00', { text: '9:30 PM' }],
  ['21:45:00', { text: '9:45 PM' }],
  ['22:00:00', { text: '10:00 PM' }],
  ['22:15:00', { text: '10:15 PM' }],
  ['22:30:00', { text: '10:30 PM' }],
  ['22:45:00', { text: '10:45 PM' }],
  ['23:00:00', { text: '11:00 PM' }],
  ['23:15:00', { text: '11:15 PM' }],
  ['23:30:00', { text: '11:30 PM' }],
  ['23:45:00', { text: '11:45 PM' }],
]);

export default function AutoBook({
  onBook: onBook,
}: {
  onBook: (minTime: string, maxTime: string) => Promise<void>;
}) {
  const [minTime, setMinTime] = useState<string>(getClosestTime(timeOptions));
  const [maxTime, setMaxTime] = useState<string>(getClosestTime(timeOptions));
  const [isAutoBooking, setIsAutoBooking] = useState<boolean>(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isAutoBooking) {
      const autoBook = async () => {
        await onBook(minTime, maxTime);
        await new Promise(resolve => setTimeout(resolve, 750));
      };

      intervalId = setInterval(autoBook, 750);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoBooking, onBook, minTime, maxTime]);

  const toggleAutoBooking = () => {
    if (!isAutoBooking) onBook(minTime, maxTime);
    setIsAutoBooking(!isAutoBooking);
  };

  const maxTimeOptions = useMemo(() => {
    const minTimeDate = timeToDate(minTime);
    const maxTimeOptions = new Map<string, { text: string }>();

    for (const [time, { text }] of timeOptions.entries()) {
      const timeDate = timeToDate(time);
      if (timeDate > minTimeDate) {
        maxTimeOptions.set(time, { text });
      }
    }

    setMaxTime(getClosestTime(maxTimeOptions));

    return maxTimeOptions;
  }, [minTime]);

  return (
    <>
      <div className="mt-4 flex flex-col">
        <h2 className="text-xl font-semibold">Auto Booking</h2>
        <p className="text-sm">
          Automatically book the experience when it becomes available.
        </p>
        <div className="flex flex-row">
          <div>
            <p className="text-sm">
              Minimum booking time is the earliest time you want to book the
              experience.
            </p>
            <Select
              className="mb-4"
              options={timeOptions}
              selected={minTime}
              onChange={setMinTime}
              title={'Minimum Booking Time'}
            />
          </div>
          <div>
            <p className="text-sm">
              Maximum booking time is the latest time you want to book the
              experience.
            </p>
            <Select
              className="mb-4"
              options={maxTimeOptions}
              selected={maxTime}
              onChange={setMaxTime}
              title={'Maximum Booking Time'}
            />
          </div>
        </div>
        <Button className="py-2 px-2" onClick={toggleAutoBooking}>
          {isAutoBooking ? 'Stop Auto Booking' : 'Start Auto Booking'}
        </Button>
      </div>
    </>
  );
}
