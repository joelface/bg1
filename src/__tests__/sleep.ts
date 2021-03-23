import { sleep } from '../sleep';

describe('sleep()', () => {
  it('sleeps for 3 seconds', async () => {
    jest.useFakeTimers();
    const promise = sleep(3000);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000);
    jest.runAllTimers();
    expect(await promise).toBeUndefined();
  });
});
