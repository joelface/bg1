import { fetchJson } from '@/fetch';
import { setTime } from '@/testing';

import { ping } from '../ping';

jest.mock('@/fetch');
jest.mocked(fetchJson).mockResolvedValue({ ok: true, status: 204, data: {} });
setTime('07:00');

const ONE_HOUR = 60 * 60_000;
const ONE_DAY = 24 * ONE_HOUR;

describe('ping()', () => {
  it('pings once per day', async () => {
    await ping('G');
    jest.advanceTimersByTime(ONE_HOUR);
    await ping('G');
    expect(fetchJson).toBeCalledTimes(1);
    expect(fetchJson).lastCalledWith('https://bg1.joelface.com/ping', {
      method: 'POST',
      data: { service: 'G' },
    });

    jest.advanceTimersByTime(ONE_DAY);
    await ping('G');
    jest.advanceTimersByTime(ONE_HOUR);
    await ping('G');
    expect(fetchJson).toBeCalledTimes(2);
  });
});
