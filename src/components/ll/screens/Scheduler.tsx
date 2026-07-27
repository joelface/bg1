import { use } from 'react';

import Tab from '@/components/Tab';
import SchedulerContext from '@/contexts/SchedulerContext';
import { formatDate } from '@/datetime';

import { HomeTabProps } from './Home';

function yn(value: boolean) {
  return value ? 'Yes' : 'No';
}

export default function Scheduler({ ref }: HomeTabProps) {
  const {
    config,
    runtime,
    actionLog,
    updateConfig,
    armForToday,
    disarm,
    pause,
    resume,
    runNow,
  } = use(SchedulerContext);

  return (
    <Tab title="Scheduler" ref={ref}>
      <div className="space-y-3 py-3">
        <section className="rounded-lg border border-gray-300 p-3">
          <h2 className="m-0 text-base font-semibold">Status</h2>
          <p className="mt-2 text-sm">
            Armed today: <strong>{yn(runtime.armedToday)}</strong>
          </p>
          <p className="mt-1 text-sm">
            Booking window open: <strong>{yn(runtime.bookingWindow.isOpen)}</strong>
          </p>
          {!runtime.bookingWindow.isOpen && (
            <p className="mt-1 text-sm">
              Opens on <strong>{formatDate(runtime.bookingWindow.opensOn)}</strong>
              {' '}({runtime.bookingWindow.daysUntilOpen} day(s))
            </p>
          )}
          <p className="mt-1 text-sm">
            Execution mode: <strong>{runtime.executionMode}</strong>
          </p>
          <p className="mt-1 text-sm">
            Pause reason: <strong>{runtime.pauseReason ?? 'none'}</strong>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded bg-green-700 px-3 py-1 text-white" onClick={armForToday}>
              Arm Today
            </button>
            <button className="rounded bg-gray-700 px-3 py-1 text-white" onClick={disarm}>
              Disarm
            </button>
            <button className="rounded bg-amber-700 px-3 py-1 text-white" onClick={() => pause()}>
              Pause
            </button>
            <button className="rounded bg-blue-700 px-3 py-1 text-white" onClick={resume}>
              Resume
            </button>
            <button className="rounded bg-purple-700 px-3 py-1 text-white" onClick={runNow}>
              Run Now
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-gray-300 p-3">
          <h2 className="m-0 text-base font-semibold">Configuration</h2>
          <p className="mt-2 text-sm">
            Enabled: <strong>{yn(config.enabled)}</strong>
          </p>
          <p className="mt-1 text-sm">
            Objective: <strong>{config.objectiveMode}</strong>
          </p>
          <p className="mt-1 text-sm">
            Selected rides: <strong>{config.selectedExperienceIds.length}</strong>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="rounded bg-slate-700 px-3 py-1 text-white"
              onClick={() => updateConfig({ enabled: !config.enabled })}
            >
              Toggle Enabled
            </button>
            <button
              className="rounded bg-slate-700 px-3 py-1 text-white"
              onClick={() =>
                updateConfig({
                  objectiveMode:
                    config.objectiveMode === 'earliest'
                      ? 'preferredWindow'
                      : 'earliest',
                })
              }
            >
              Toggle Objective
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-gray-300 p-3">
          <h2 className="m-0 text-base font-semibold">Recent Actions</h2>
          {actionLog.length === 0 ? (
            <p className="mt-2 text-sm">No scheduler actions recorded yet.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {actionLog
                .slice(-8)
                .reverse()
                .map((action, idx) => (
                  <li key={`${action.atMS}-${idx}`}>
                    {new Date(action.atMS).toLocaleTimeString()} - {action.type}
                    {action.reason ? ` (${action.reason})` : ''}
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </Tab>
  );
}
