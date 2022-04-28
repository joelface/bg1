import { h } from 'preact';
import FakeTimers from '@sinonjs/fake-timers';

import { render, screen } from '@/testing';
import TimeBoard, { TIME_IS_IDS } from '../TimeBoard';

jest.mock('@/datetime', () => {
  return {
    dateTimeStrings: () => ({ date: '2020-04-05', time: '12:59:47.328' }),
  };
});

self.time_is_widget = { init: jest.fn() };

function setup() {
  render(<TimeBoard resort="WDW" label="Next queue opening" time="13:00:00" />);
}

describe('TimeBoard', () => {
  const unsyncedMsg = '(unsynced)';
  const clock = FakeTimers.install();

  beforeEach(() => {
    clock.runToLast();
    setup();
  });

  it('shows next queue open time and current time', () => {
    const ths = screen.getAllByRole('rowheader');
    const tds = screen.getAllByRole('cell');
    expect(ths[0]).toHaveTextContent('Next queue opening:');
    expect(tds[0]).toHaveTextContent('13:00:00');
    expect(ths[1]).toHaveTextContent('Current time:');
    expect(tds[1]).toHaveTextContent('12:59:47');
  });

  it("doesn't show unsynced if syncing succeeds", async () => {
    // Fake clock syncing
    (document.getElementById(TIME_IS_IDS.WDW) as HTMLElement).innerHTML =
      '<span>12:59:48</span>';
    await clock.tickAsync(5000);
    expect(screen.queryByText(unsyncedMsg)).not.toBeInTheDocument();
  });

  it('shows unsynced if syncing fails', async () => {
    expect(screen.queryByText(unsyncedMsg)).not.toBeInTheDocument();
    await clock.tickAsync(5000);
    expect(await screen.findByText(unsyncedMsg)).toBeInTheDocument();
  });
});
