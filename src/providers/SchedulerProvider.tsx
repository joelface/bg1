import { use, useCallback, useMemo, useState } from 'react';

import BookingDateContext from '@/contexts/BookingDateContext';
import SchedulerContext from '@/contexts/SchedulerContext';
import { parkDate } from '@/datetime';
import {
  defaultSchedulerConfig,
  getBookingWindowState,
  getExecutionMode,
  isArmedForToday,
  loadSchedulerConfig,
  readSchedulerActionLog,
  saveSchedulerConfig,
  setArmedForToday,
} from '@/scheduler/persistence';
import {
  SchedulerActionLog,
  SchedulerConfig,
  SchedulerRuntimeState,
} from '@/scheduler/types';

export default function SchedulerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { bookingDate } = use(BookingDateContext);
  const [config, setConfig] = useState<SchedulerConfig>(loadSchedulerConfig);
  const [actionLog] = useState<SchedulerActionLog[]>(readSchedulerActionLog);
  const [armedToday, setArmed] = useState(isArmedForToday);
  const [pauseReason, setPauseReason] = useState<
    SchedulerRuntimeState['pauseReason']
  >();
  const [nextRunAtMS, setNextRunAtMS] = useState<number | undefined>();

  const bookingWindow = useMemo(
    () =>
      getBookingWindowState(bookingDate, {
        today: parkDate(),
        bookingWindowDays: config.bookingWindowDays,
      }),
    [bookingDate, config.bookingWindowDays]
  );
  const executionMode = getExecutionMode({
    bookingWindow,
    simulationBeforeWindow: config.simulationBeforeWindow,
  });

  const runtime: SchedulerRuntimeState = {
    armedToday,
    executionMode,
    bookingWindow,
    nextRunAtMS,
    pauseReason:
      pauseReason ?? (!bookingWindow.isOpen ? 'paused-prebooking-window' : undefined),
  };

  const updateConfig = useCallback((update: Partial<SchedulerConfig>) => {
    setConfig(prev => {
      const next = {
        ...prev,
        ...update,
        guardrails: {
          ...prev.guardrails,
          ...update.guardrails,
        },
      };
      saveSchedulerConfig(next);
      return next;
    });
  }, []);

  const armForToday = useCallback(() => {
    setArmedForToday(true);
    setArmed(true);
  }, []);

  const disarm = useCallback(() => {
    setArmedForToday(false);
    setArmed(false);
  }, []);

  const pause = useCallback((reason?: SchedulerRuntimeState['pauseReason']) => {
    setPauseReason(reason ?? 'paused-manual');
  }, []);

  const resume = useCallback(() => {
    setPauseReason(undefined);
  }, []);

  const runNow = useCallback(() => {
    // Full orchestration loop is implemented in the next phase.
    setNextRunAtMS(Date.now());
  }, []);

  return (
    <SchedulerContext
      value={{
        config,
        runtime,
        actionLog,
        updateConfig,
        armForToday,
        disarm,
        pause,
        resume,
        runNow,
      }}
    >
      {children}
    </SchedulerContext>
  );
}

export { defaultSchedulerConfig };
