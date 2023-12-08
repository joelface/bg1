import { useCallback, useState } from 'react';

export default function useThrottleable(callback: () => void) {
  const [, setLastCalled] = useState(0);
  return useCallback(
    (timeSinceLastCallMS = 0) => {
      setLastCalled(lastCall => {
        if (Date.now() - lastCall < timeSinceLastCallMS) return lastCall;
        callback();
        return Date.now();
      });
    },
    [callback]
  );
}
