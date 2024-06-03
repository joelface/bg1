import { setTime } from '@/testing';

import { ping } from '../ping';

const fetch = jest.fn(() => ({ ok: true, status: 204, data: {} }));
self.fetch = fetch as any;
setTime('07:00');

const ONE_HOUR = 60 * 60_000;
const ONE_DAY = 24 * ONE_HOUR;

describe('ping()', () => {
  it('pings once per day', async () => {
    const wdw = { id: 'WDW' as const };
    await ping(wdw, 'G');
    jest.advanceTimersByTime(ONE_HOUR);
    await ping(wdw, 'G');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenLastCalledWith('https://bg1.joelface.com/ping', {
      method: 'POST',
      body: new URLSearchParams({ resort: wdw.id, service: 'G' }),
    });

    jest.advanceTimersByTime(ONE_DAY);
    await ping(wdw, 'G');
    jest.advanceTimersByTime(ONE_HOUR);
    await ping(wdw, 'G');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
