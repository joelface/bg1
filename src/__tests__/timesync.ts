import { MIN_RESYNC_MS, SyncFailed, now, syncTime } from '@/timesync';

jest.useFakeTimers();

const fetch = jest.fn(async () => {
  const offset = mockOffsets.shift();
  if (offset === null || offset === undefined) {
    return { ok: false };
  }
  const time = (Date.now() + offset + 50) / 1000;
  jest.advanceTimersByTime(100);
  return {
    ok: true,
    headers: new Headers({ T: String(time) }),
  };
}) as any;
self.fetch = fetch;

type Offset = number | null;

let mockOffsets: Offset[] = [];

async function mockSync(offsets: Offset[]) {
  fetch.mockClear();
  mockOffsets = [...offsets];
  try {
    await syncTime();
    return now() - Date.now();
  } finally {
    expect(fetch).toHaveBeenCalledTimes(offsets.length);
  }
}

const advanceForResync = () => jest.advanceTimersByTime(MIN_RESYNC_MS);

describe('syncTime()', () => {
  beforeEach(advanceForResync);

  it('syncs if two offset checks are within 100 ms of each other', async () => {
    expect(await mockSync([100, 200])).toBe(150);
    // Clock offset is cached for 5 minutes
    expect(await mockSync([])).toBe(150);
    advanceForResync();
    expect(await mockSync([-101, 0, 101, -25])).toBe(-12);
  });

  it('throws SyncFailed if unsuccessful', async () => {
    await expect(mockSync([100, null, null, 201, -1])).rejects.toThrow(
      SyncFailed
    );
  });
});
