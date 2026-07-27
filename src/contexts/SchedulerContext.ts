import { createContext } from 'react';

import {
  SchedulerActionLog,
  SchedulerConfig,
  SchedulerRuntimeState,
} from '@/scheduler/types';

export interface SchedulerState {
  config: SchedulerConfig;
  runtime: SchedulerRuntimeState;
  actionLog: SchedulerActionLog[];
}

export interface SchedulerCommands {
  updateConfig: (update: Partial<SchedulerConfig>) => void;
  armForToday: () => void;
  disarm: () => void;
  pause: (reason?: SchedulerRuntimeState['pauseReason']) => void;
  resume: () => void;
  runNow: () => void;
}

export type SchedulerContextValue = SchedulerState & SchedulerCommands;

const noop = () => undefined;

export default createContext<SchedulerContextValue>({
  config: {
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
  },
  runtime: {
    armedToday: false,
    executionMode: 'simulation',
    bookingWindow: {
      isOpen: false,
      opensOn: '',
      daysUntilOpen: 0,
    },
  },
  actionLog: [],
  updateConfig: noop,
  armForToday: noop,
  disarm: noop,
  pause: noop,
  resume: noop,
  runNow: noop,
});
