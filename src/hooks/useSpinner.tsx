import { useCallback, useState } from 'react';

import Overlay from '/components/Overlay';
import { useTheme } from '/contexts/Theme';
import RefreshIcon from '/icons/RefreshIcon';
import { sleep } from '/sleep';

export default function useSpinner(): [
  React.ReactNode | null,
  typeof showSpinner
] {
  const [spinCount, setSpinCount] = useState(0);
  const showSpinner = useCallback(
    async (callback: () => Promise<void>, minMS = 500) => {
      setSpinCount(count => count + 1);
      const awaken = sleep(minMS);
      try {
        await callback();
      } finally {
        await awaken;
        setSpinCount(count => count - 1);
      }
    },
    []
  );
  const spinner = spinCount > 0 ? <Spinner /> : null;
  return [spinner, showSpinner];
}

export function Spinner() {
  const { bg } = useTheme();
  return (
    <Overlay className="flex items-center bg-white bg-opacity-75">
      <div className="w-[50px] mx-auto">
        <div aria-label="Loading…" className={`rounded-full p-[20%] ${bg}`}>
          <RefreshIcon className="animate-spin w-full text-white" />
        </div>
      </div>
    </Overlay>
  );
}
