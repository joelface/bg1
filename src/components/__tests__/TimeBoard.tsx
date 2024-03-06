import { render, screen, see, setTime, waitFor } from '@/testing';
import { SyncFailed, syncTime } from '@/timesync';

import TimeBoard from '../TimeBoard';

jest.mock('@/timesync');

function renderComponent() {
  render(<TimeBoard label="Next queue opening" time="13:00:00" />);
}

describe('TimeBoard', () => {
  const UNSYNCED_MSG = '(unsynced)';

  beforeEach(() => {
    setTime('12:59:47');
  });

  it('shows next queue open time and current time', () => {
    renderComponent();
    const ths = screen.getAllByRole('rowheader');
    const tds = screen.getAllByRole('cell');
    expect(ths[0]).toHaveTextContent('Next queue opening:');
    expect(tds[0]).toHaveTextContent('13:00:00');
    expect(ths[1]).toHaveTextContent('Current time:');
    expect(tds[1]).toHaveTextContent('12:59:47');
    expect(syncTime).toHaveBeenCalledTimes(1);
    see.no(UNSYNCED_MSG);
  });

  it('shows unsynced if syncing fails', async () => {
    jest.mocked(syncTime).mockRejectedValue(SyncFailed);
    renderComponent();
    await waitFor(() => see(UNSYNCED_MSG));
  });
});
