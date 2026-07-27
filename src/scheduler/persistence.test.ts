import { modifyDate } from '@/datetime';
import kvdb from '@/kvdb';
import { TODAY } from '@/testing';

import {
  defaultSchedulerConfig,
  getBookingWindowState,
  getExecutionMode,
  isArmedForToday,
  loadSchedulerConfig,
  saveSchedulerConfig,
  setArmedForToday,
} from './persistence';

describe('scheduler persistence', () => {
  beforeEach(() => kvdb.clear());

  it('loads defaults when config is missing', () => {
    expect(loadSchedulerConfig()).toEqual(defaultSchedulerConfig);
  });

  it('saves and loads config with guardrail merge', () => {
    saveSchedulerConfig({
      ...defaultSchedulerConfig,
      enabled: true,
      guardrails: {
        ...defaultSchedulerConfig.guardrails,
        minActionSpacingMS: 12345,
      },
    });

    const loaded = loadSchedulerConfig();
    expect(loaded.enabled).toBe(true);
    expect(loaded.guardrails.minActionSpacingMS).toBe(12345);
    expect(loaded.guardrails.maxAttemptsPerHour).toBe(
      defaultSchedulerConfig.guardrails.maxAttemptsPerHour
    );
  });

  it('tracks daily armed state', () => {
    expect(isArmedForToday()).toBe(false);
    setArmedForToday(true);
    expect(isArmedForToday()).toBe(true);
    setArmedForToday(false);
    expect(isArmedForToday()).toBe(false);
  });

  it('computes booking window state', () => {
    const bookingDate = modifyDate(TODAY, 70);
    const state = getBookingWindowState(bookingDate, {
      today: TODAY,
      bookingWindowDays: 60,
    });
    expect(state.isOpen).toBe(false);
    expect(state.daysUntilOpen).toBe(10);

    const openState = getBookingWindowState(modifyDate(TODAY, 60), {
      today: TODAY,
      bookingWindowDays: 60,
    });
    expect(openState.isOpen).toBe(true);
    expect(openState.daysUntilOpen).toBe(0);
  });

  it('derives execution mode', () => {
    expect(
      getExecutionMode({
        bookingWindow: { isOpen: true, opensOn: TODAY, daysUntilOpen: 0 },
        simulationBeforeWindow: true,
      })
    ).toBe('liveBooking');

    expect(
      getExecutionMode({
        bookingWindow: { isOpen: false, opensOn: TODAY, daysUntilOpen: 1 },
        simulationBeforeWindow: true,
      })
    ).toBe('simulation');

    expect(
      getExecutionMode({
        bookingWindow: { isOpen: false, opensOn: TODAY, daysUntilOpen: 1 },
        simulationBeforeWindow: false,
      })
    ).toBe('liveBooking');
  });
});
