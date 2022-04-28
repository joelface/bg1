import FakeTimers from '@sinonjs/fake-timers';

import { sleep } from '../sleep';

describe('sleep()', () => {
  const clock = FakeTimers.install();
  jest.spyOn(self, 'setTimeout');

  it('sleeps for 3 seconds', async () => {
    const promise = sleep(3000);
    expect(setTimeout).toBeCalledTimes(1);
    expect(setTimeout).lastCalledWith(expect.any(Function), 3000);
    clock.runToLast();
    expect(await promise).toBeUndefined();
  });
});
