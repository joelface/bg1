import { fetchJson } from '@/fetch';
import { setTime } from '@/testing';
import { ping } from '../ping';

jest.mock('@/fetch');
const fetchJsonMock = fetchJson as jest.MockedFunction<typeof fetchJson>;
fetchJsonMock.mockResolvedValue({ status: 204, data: {} });

jest.useFakeTimers();

describe('ping()', () => {
  it('pings once per day', async () => {
    setTime('07:00');
    await ping();
    setTime('08:00');
    await ping();
    expect(fetchJsonMock).toBeCalledTimes(1);
    expect(fetchJsonMock).lastCalledWith('https://bg1.joelface.com/ping', {
      method: 'POST',
    });

    setTime('07:00', 1);
    await ping();
    setTime('08:00', 1);
    await ping();
    expect(fetchJsonMock).toBeCalledTimes(2);
  });
});
