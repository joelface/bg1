import { sleep } from '../sleep';

describe('sleep()', () => {
  it('sleeps for 3 seconds', async () => {
    jest.useFakeTimers();
    const promise = sleep(3000);
    expect(setTimeout).toBeCalledTimes(1);
    expect(setTimeout).lastCalledWith(expect.any(Function), 3000);
    jest.runAllTimers();
    expect(await promise).toBeUndefined();
  });
});
