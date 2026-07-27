import { modifyDate, parkDate, toDate } from '@/datetime';
import kvdb from '@/kvdb';

import {
  SchedulerActionLog,
  SchedulerBookingWindowState,
  SchedulerConfig,
  SchedulerExecutionMode,
} from './types';

const KEY_PREFIX = 'bg1.scheduler';

export const schedulerKeys = {
  config: `${KEY_PREFIX}.config`,
  armedToday: `${KEY_PREFIX}.armedToday`,
  actionLog: `${KEY_PREFIX}.actionLog`,
  simulatedRecommendation: `${KEY_PREFIX}.simulatedRecommendation`,
};

export const defaultSchedulerConfig: SchedulerConfig = {
  enabled: false,
  objectiveMode: 'earliest',
  selectedExperienceIds: [],
  aggressiveness: 'conservative',
  bookingWindowDays: 60,
  minImprovementMinutes: 1,
  simulationBeforeWindow: true,
  guardrails: {
    maxAttemptsPerHour: 12,
    minActionSpacingMS: 90_000,
    duplicateActionWindowMS: 10 * 60_000,
    perAttractionCooldownMS: 20 * 60_000,
  },
};

function mergeGuardrails(config?: Partial<SchedulerConfig>): SchedulerConfig {
  return {
    ...defaultSchedulerConfig,
    ...config,
    guardrails: {
      ...defaultSchedulerConfig.guardrails,
      ...config?.guardrails,
    },
  };
}

export function loadSchedulerConfig() {
  return mergeGuardrails(kvdb.get<Partial<SchedulerConfig>>(schedulerKeys.config));
}

export function saveSchedulerConfig(config: SchedulerConfig) {
  kvdb.set(schedulerKeys.config, config);
}

export function isArmedForToday() {
  return !!kvdb.getDaily<boolean>(schedulerKeys.armedToday);
}

export function setArmedForToday(armed: boolean) {
  if (armed) {
    kvdb.setDaily(schedulerKeys.armedToday, true);
  } else {
    kvdb.delete(schedulerKeys.armedToday);
  }
}

export function getBookingWindowState(
  bookingDate: string,
  {
    today = parkDate(),
    bookingWindowDays = defaultSchedulerConfig.bookingWindowDays,
  }: { today?: string; bookingWindowDays?: number } = {}
): SchedulerBookingWindowState {
  const opensOn = modifyDate(bookingDate, -Math.abs(bookingWindowDays));
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilOpen = Math.max(
    0,
    Math.ceil((+toDate(opensOn) - +toDate(today)) / msPerDay)
  );

  return {
    isOpen: daysUntilOpen === 0,
    opensOn,
    daysUntilOpen,
  };
}

export function getExecutionMode({
  bookingWindow,
  simulationBeforeWindow,
}: {
  bookingWindow: SchedulerBookingWindowState;
  simulationBeforeWindow: boolean;
}): SchedulerExecutionMode {
  if (bookingWindow.isOpen) return 'liveBooking';
  return simulationBeforeWindow ? 'simulation' : 'liveBooking';
}

export function appendSchedulerActionLog(action: SchedulerActionLog, max = 60) {
  const log = kvdb.get<SchedulerActionLog[]>(schedulerKeys.actionLog) ?? [];
  kvdb.set(schedulerKeys.actionLog, [...log, action].slice(-max));
}

export function readSchedulerActionLog() {
  return kvdb.get<SchedulerActionLog[]>(schedulerKeys.actionLog) ?? [];
}

export function saveSimulatedRecommendation(action: SchedulerActionLog) {
  kvdb.set(schedulerKeys.simulatedRecommendation, action);
}

export function readSimulatedRecommendation() {
  return kvdb.get<SchedulerActionLog>(schedulerKeys.simulatedRecommendation);
}
