import { createBooking, hm, sm } from '@/__fixtures__/ll';
import { DateTime, ParkTime, modifyDate } from '@/datetime';
import { TODAY } from '@/testing';

import { decideSchedulerAction } from './engine';
import { defaultSchedulerConfig, getBookingWindowState } from './persistence';
import { SchedulerEngineInput } from './types';

declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: (value: unknown) => {
  toBe: (expected: unknown) => void;
  toEqual: (expected: unknown) => void;
};

function makeInput(partial: Partial<SchedulerEngineInput> = {}): SchedulerEngineInput {
  return {
    nowMS: +new Date(`${TODAY}T10:00:00`),
    today: TODAY,
    bookingDate: TODAY,
    config: {
      ...defaultSchedulerConfig,
      enabled: true,
      selectedExperienceIds: [hm.id],
    },
    bookingWindow: getBookingWindowState(TODAY, { today: TODAY }),
    executionMode: 'liveBooking',
    experiences: [hm],
    currentBookings: [],
    recentActions: [],
    ...partial,
  };
}

describe('decideSchedulerAction', () => {
  it('returns noop when disabled', () => {
    const action = decideSchedulerAction(
      makeInput({ config: { ...defaultSchedulerConfig, enabled: false, selectedExperienceIds: [hm.id] } })
    );
    expect(action).toEqual({ type: 'noop', reason: 'disabled' });
  });

  it('returns noop when no rides selected', () => {
    const action = decideSchedulerAction(
      makeInput({ config: { ...defaultSchedulerConfig, enabled: true, selectedExperienceIds: [] } })
    );
    expect(action).toEqual({ type: 'noop', reason: 'no-selected-rides' });
  });

  it('returns book when there is no current booking', () => {
    const action = decideSchedulerAction(makeInput());
    expect(action.type).toBe('book');
    expect(action.candidate?.experience.id).toBe(hm.id);
  });

  it('returns rebook when candidate is better by threshold', () => {
    const current = createBooking(hm, { startTime: new ParkTime(12) });
    const action = decideSchedulerAction(
      makeInput({
        currentBookings: [current],
      })
    );
    expect(action.type).toBe('rebook');
    expect(action.currentBooking).toBe(current);
  });

  it('returns noop when candidate is not better than current booking', () => {
    const current = createBooking(hm, { startTime: new ParkTime(10, 30) });
    const action = decideSchedulerAction(
      makeInput({
        currentBookings: [current],
      })
    );
    expect(action).toEqual({ type: 'noop', reason: 'not-better-than-current' });
  });

  it('uses preferred window mode when configured', () => {
    const action = decideSchedulerAction(
      makeInput({
        config: {
          ...defaultSchedulerConfig,
          enabled: true,
          objectiveMode: 'preferredWindow',
          preferredWindow: {
            start: ParkTime.from('11:00:00'),
            end: ParkTime.from('11:30:00'),
          },
          selectedExperienceIds: [sm.id, hm.id],
        },
        experiences: [sm, hm],
      })
    );
    expect(action.type).toBe('book');
    expect(action.candidate?.experience.id).toBe(hm.id);
  });

  it('returns simulation recommendation before booking window opens', () => {
    const bookingDate = modifyDate(TODAY, 75);
    const action = decideSchedulerAction(
      makeInput({
        bookingDate,
        bookingWindow: getBookingWindowState(bookingDate, { today: TODAY }),
        executionMode: 'simulation',
      })
    );
    expect(action.type).toBe('simulateRecommendation');
    expect(action.reason).toBe('prebooking-window');
  });

  it('applies max attempts guardrail', () => {
    const nowMS = +new Date(`${TODAY}T10:00:00`);
    const action = decideSchedulerAction(
      makeInput({
        nowMS,
        recentActions: Array.from({ length: 12 }, (_, i) => ({
          atMS: nowMS - i * 60_000,
          type: 'book' as const,
          experienceId: hm.id,
          start: new DateTime(TODAY, ParkTime.from('11:10:00')),
        })),
      })
    );
    expect(action).toEqual({ type: 'noop', reason: 'guardrail-max-attempts' });
  });

  it('applies duplicate action guardrail', () => {
    const nowMS = +new Date(`${TODAY}T10:00:00`);
    const action = decideSchedulerAction(
      makeInput({
        nowMS,
        config: {
          ...defaultSchedulerConfig,
          enabled: true,
          selectedExperienceIds: [hm.id],
          guardrails: {
            ...defaultSchedulerConfig.guardrails,
            minActionSpacingMS: 0,
          },
        },
        recentActions: [
          {
            atMS: nowMS - 60_000,
            type: 'book',
            experienceId: hm.id,
            start: new DateTime(TODAY, ParkTime.from('11:10:00')),
          },
        ],
      })
    );
    expect(action).toEqual({ type: 'noop', reason: 'guardrail-duplicate' });
  });
});
