import { sleep } from '../sleep';

jest.useFakeTimers();
jest.spyOn(self, 'setTimeout');

describe('sleep()', () => {
  it('sleeps for 3 seconds', async () => {
    const promise = sleep(3000);
    expect(setTimeout).toBeCalledTimes(1);
    expect(setTimeout).lastCalledWith(expect.any(Function), 3000);
    jest.runOnlyPendingTimers();
    expect(await promise).toBeUndefined();
  });
});
