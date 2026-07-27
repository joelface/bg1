import { Experience } from '@/api/ll';
import { LLMP } from '@/api/itinerary';
import { DateTime, ParkTime } from '@/datetime';

import {
  SchedulerAction,
  SchedulerCandidate,
  SchedulerEngineInput,
  SchedulerObjectiveMode,
  SchedulerRecentAction,
  SchedulerTimeWindow,
} from './types';

function toDateTime(date: string, time: ParkTime) {
  return new DateTime(date, time);
}

function toEpochMS(dt: DateTime) {
  return +new Date(`${dt.date}T${dt.time}`);
}

function diffMinutes(a: DateTime, b: DateTime) {
  return (toEpochMS(a) - toEpochMS(b)) / 60_000;
}

function inWindow(time: ParkTime, window: SchedulerTimeWindow) {
  return time >= window.start && time <= window.end;
}

function getNextTime(exp: Experience) {
  return exp.flex?.available && exp.flex.nextAvailableTime
    ? exp.flex.nextAvailableTime
    : undefined;
}

function buildCandidates({
  experiences,
  bookingDate,
  selectedExperienceIds,
}: {
  experiences: Experience[];
  bookingDate: string;
  selectedExperienceIds: string[];
}): SchedulerCandidate[] {
  const selected = new Set(selectedExperienceIds);
  const selectedRank = new Map(selectedExperienceIds.map((id, i) => [id, i]));

  return experiences
    .filter(exp => selected.has(exp.id))
    .map(exp => {
      const nextTime = getNextTime(exp);
      return nextTime
        ? {
            experience: exp,
            start: toDateTime(bookingDate, nextTime),
          }
        : undefined;
    })
    .filter((c): c is SchedulerCandidate => !!c)
    .sort(
      (a, b) =>
        (selectedRank.get(a.experience.id) ?? Number.MAX_SAFE_INTEGER) -
          (selectedRank.get(b.experience.id) ?? Number.MAX_SAFE_INTEGER) ||
        diffMinutes(a.start, b.start)
    );
}

function pickCandidate(
  candidates: SchedulerCandidate[],
  objectiveMode: SchedulerObjectiveMode,
  preferredWindow?: SchedulerTimeWindow
) {
  if (objectiveMode === 'preferredWindow' && preferredWindow) {
    const inWindowCandidates = candidates.filter(c =>
      inWindow(c.start.time, preferredWindow)
    );
    if (inWindowCandidates[0]) return inWindowCandidates[0];
  }

  return [...candidates].sort((a, b) => diffMinutes(a.start, b.start))[0];
}

function comparableBooking(
  bookings: LLMP[],
  selectedExperienceIds: string[]
): LLMP | undefined {
  const selected = new Set(selectedExperienceIds);
  return bookings
    .filter(b => selected.has(b.facilityId))
    .sort((a, b) => diffMinutes(a.start, b.start))[0];
}

function hasGuardrailBlock(input: SchedulerEngineInput, action: SchedulerAction) {
  const nowMS = input.nowMS;
  const { guardrails } = input.config;
  const recent = input.recentActions;

  const inLastHour = recent.filter(a => nowMS - a.atMS <= 60 * 60_000).length;
  if (inLastHour >= guardrails.maxAttemptsPerHour) {
    return 'guardrail-max-attempts' as const;
  }

  const lastAction = recent.sort((a, b) => b.atMS - a.atMS)[0];
  if (lastAction && nowMS - lastAction.atMS < guardrails.minActionSpacingMS) {
    return 'guardrail-min-spacing' as const;
  }

  if (!action.candidate) return;

  const recentSameKey = recent.find(
    a =>
      a.experienceId === action.candidate?.experience.id &&
      a.start.toString() === action.candidate?.start.toString() &&
      nowMS - a.atMS < guardrails.duplicateActionWindowMS
  );
  if (recentSameKey) return 'guardrail-duplicate' as const;

  const recentByAttraction = recent.find(
    a =>
      a.experienceId === action.candidate?.experience.id &&
      nowMS - a.atMS < guardrails.perAttractionCooldownMS
  );
  if (recentByAttraction) return 'guardrail-cooldown' as const;
}

function maybeNoop(reason: SchedulerAction['reason']): SchedulerAction {
  return { type: 'noop', reason };
}

export function decideSchedulerAction(input: SchedulerEngineInput): SchedulerAction {
  const { config } = input;

  if (!config.enabled) return maybeNoop('disabled');
  if (config.selectedExperienceIds.length === 0) return maybeNoop('no-selected-rides');

  const candidates = buildCandidates({
    experiences: input.experiences,
    bookingDate: input.bookingDate,
    selectedExperienceIds: config.selectedExperienceIds,
  });
  if (candidates.length === 0) return maybeNoop('no-candidates');

  const candidate = pickCandidate(
    candidates,
    config.objectiveMode,
    config.preferredWindow
  );
  if (!candidate) return maybeNoop('no-candidates');

  if (input.executionMode === 'simulation' && !input.bookingWindow.isOpen) {
    const action: SchedulerAction = {
      type: 'simulateRecommendation',
      reason: 'prebooking-window',
      candidate,
    };
    const guardrail = hasGuardrailBlock(input, action);
    return guardrail ? maybeNoop(guardrail) : action;
  }

  const current = comparableBooking(
    input.currentBookings,
    config.selectedExperienceIds
  );

  const action: SchedulerAction = current
    ? {
        type:
          diffMinutes(current.start, candidate.start) >=
          config.minImprovementMinutes
            ? 'rebook'
            : 'noop',
        reason: 'ready',
        candidate,
        currentBooking: current,
      }
    : {
        type: 'book',
        reason: 'ready',
        candidate,
      };

  if (action.type === 'noop') {
    return maybeNoop('not-better-than-current');
  }

  const guardrail = hasGuardrailBlock(input, action);
  return guardrail ? maybeNoop(guardrail) : action;
}

export function actionToRecent(
  action: SchedulerAction,
  atMS: number
): SchedulerRecentAction | undefined {
  if (
    (action.type === 'book' ||
      action.type === 'rebook' ||
      action.type === 'simulateRecommendation') &&
    action.candidate
  ) {
    return {
      atMS,
      type: action.type,
      experienceId: action.candidate.experience.id,
      start: action.candidate.start,
    };
  }
}
