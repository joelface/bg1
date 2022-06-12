import { act, render, screen } from '/testing';
import TimeBoard, { TIME_IS_IDS } from '../TimeBoard';

jest.mock('/datetime', () => {
  return {
    dateTimeStrings: () => ({ date: '2020-04-05', time: '12:59:47.328' }),
  };
});

self.time_is_widget = { init: jest.fn() };

function renderComponent() {
  render(<TimeBoard resort="WDW" label="Next queue opening" time="13:00:00" />);
}

describe('TimeBoard', () => {
  const unsyncedMsg = '(unsynced)';
  jest.useFakeTimers();

  it('shows next queue open time and current time', () => {
    renderComponent();
    const ths = screen.getAllByRole('rowheader');
    const tds = screen.getAllByRole('cell');
    expect(ths[0]).toHaveTextContent('Next queue opening:');
    expect(tds[0]).toHaveTextContent('13:00:00');
    expect(ths[1]).toHaveTextContent('Current time:');
    expect(tds[1]).toHaveTextContent('12:59:47');
  });

  it("doesn't show unsynced if syncing succeeds", async () => {
    renderComponent();
    // Fake clock syncing
    (document.getElementById(TIME_IS_IDS.WDW) as HTMLElement).innerHTML =
      '<span>12:59:48</span>';
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.queryByText(unsyncedMsg)).not.toBeInTheDocument();
  });

  it('shows unsynced if syncing fails', async () => {
    renderComponent();
    expect(screen.queryByText(unsyncedMsg)).not.toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(await screen.findByText(unsyncedMsg)).toBeInTheDocument();
  });
});
