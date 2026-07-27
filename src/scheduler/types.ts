import { Experience } from '@/api/ll';
import { LLMP } from '@/api/itinerary';
import { DateTime, ParkTime } from '@/datetime';

export type SchedulerObjectiveMode = 'earliest' | 'preferredWindow';
export type SchedulerExecutionMode = 'liveBooking' | 'simulation';
export type SchedulerAggressiveness = 'conservative' | 'balanced' | 'aggressive';

export interface SchedulerTimeWindow {
  start: ParkTime;
  end: ParkTime;
}

export interface SchedulerGuardrails {
  maxAttemptsPerHour: number;
  minActionSpacingMS: number;
  duplicateActionWindowMS: number;
  perAttractionCooldownMS: number;
}

export interface SchedulerConfig {
  enabled: boolean;
  objectiveMode: SchedulerObjectiveMode;
  preferredWindow?: SchedulerTimeWindow;
  selectedExperienceIds: string[];
  aggressiveness: SchedulerAggressiveness;
  bookingWindowDays: number;
  minImprovementMinutes: number;
  simulationBeforeWindow: boolean;
  guardrails: SchedulerGuardrails;
}

export interface SchedulerBookingWindowState {
  isOpen: boolean;
  opensOn: string;
  daysUntilOpen: number;
}

export type SchedulerPauseReason =
  | 'paused-auth'
  | 'paused-rate-limit'
  | 'paused-offline'
  | 'paused-prebooking-window'
  | 'paused-manual'
  | 'recoverable-error';

export interface SchedulerRuntimeState {
  armedToday: boolean;
  executionMode: SchedulerExecutionMode;
  bookingWindow: SchedulerBookingWindowState;
  pauseReason?: SchedulerPauseReason;
  nextRunAtMS?: number;
  lastSuccessAtMS?: number;
  lastError?: string;
}

export type SchedulerActionType =
  | 'noop'
  | 'simulateRecommendation'
  | 'book'
  | 'rebook';

export type SchedulerNoopReason =
  | 'disabled'
  | 'no-selected-rides'
  | 'no-candidates'
  | 'not-better-than-current'
  | 'guardrail-max-attempts'
  | 'guardrail-min-spacing'
  | 'guardrail-duplicate'
  | 'guardrail-cooldown';

export interface SchedulerCandidate {
  experience: Experience;
  start: DateTime;
}

export interface SchedulerAction {
  type: SchedulerActionType;
  reason?: SchedulerNoopReason | 'prebooking-window' | 'ready';
  candidate?: SchedulerCandidate;
  currentBooking?: LLMP;
}

export interface SchedulerActionLog {
  atMS: number;
  type: SchedulerActionType;
  reason?: string;
  experienceId?: string;
  start?: DateTime;
}

export interface SchedulerRecentAction {
  atMS: number;
  type: Extract<SchedulerActionType, 'book' | 'rebook' | 'simulateRecommendation'>;
  experienceId: string;
  start: DateTime;
}

export interface SchedulerEngineInput {
  nowMS: number;
  today: string;
  bookingDate: string;
  config: SchedulerConfig;
  bookingWindow: SchedulerBookingWindowState;
  executionMode: SchedulerExecutionMode;
  experiences: Experience[];
  currentBookings: LLMP[];
  recentActions: SchedulerRecentAction[];
}
