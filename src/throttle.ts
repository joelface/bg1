export function throttle<A extends unknown[], R>(
  callback: (...args: A) => R,
  minTimeMS: number
) {
  let lastCalledAt = 0;
  let lastResult: R;
  return (...args: A) => {
    if (Date.now() - lastCalledAt >= minTimeMS) {
      lastCalledAt = Date.now();
      lastResult = callback(...args);
    }
    return lastResult;
  };
}
