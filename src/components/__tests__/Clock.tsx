import { act, render, see, setTime, waitFor } from '@/testing';
import { SyncFailed, syncTime } from '@/timesync';

import Clock from '../Clock';

jest.mock('@/timesync');
const onSync = jest.fn();

describe('Clock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setTime('12:59:47');
  });

  it('shows current time', async () => {
    render(<Clock onSync={onSync} />);
    see('12:59:47');
    act(() => jest.advanceTimersByTime(1000));
    await waitFor(() => see('12:59:48'));
    expect(syncTime).toHaveBeenCalledTimes(1);
    expect(onSync).toHaveBeenCalledTimes(1);
    expect(onSync).toHaveBeenCalledWith(true);
  });

  it('calls onSync(false) when syncing fails', async () => {
    jest.mocked(syncTime).mockRejectedValue(SyncFailed);
    render(<Clock onSync={onSync} />);
    await waitFor(() => expect(onSync).toHaveBeenCalledWith(false));
  });
});
