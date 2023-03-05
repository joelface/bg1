import { useCallback, useState } from 'react';

import Spinner from '@/components/Spinner';
import useFlash from '@/hooks/useFlash';
import { sleep } from '@/sleep';

const LOAD_MIN_MS = 500;

export type DataLoader = (
  callback: (flash: ReturnType<typeof useFlash>[1]) => Promise<void>,
  options?: {
    messages?: {
      error?: string;
      request?: string;
      [status: number]: string;
    };
    minLoadTime?: number;
  }
) => Promise<void>;

export default function useDataLoader(): {
  loaderElem: React.ReactNode;
  loadData: DataLoader;
  flash: typeof flash;
} {
  const [loadCount, setLoadCount] = useState(0);
  const [flashElem, flash] = useFlash();

  const loadData = useCallback<DataLoader>(
    async (callback, options = {}) => {
      const { messages = {}, minLoadTime = LOAD_MIN_MS } = options;
      const msgs: Required<typeof messages> = {
        error: 'Unknown error occurred',
        request: 'Network request failed',
        ...messages,
      };
      flash('');

      let doFlash: () => void = () => null;
      const completion = new Promise(resolve => {
        doFlash = () => resolve(null);
      });

      async function delayFlash(...args: Parameters<typeof flash>) {
        await completion;
        flash(...args);
      }

      setLoadCount(count => count + 1);
      const awaken = sleep(minLoadTime);
      try {
        await callback(delayFlash);
      } catch (error: any) {
        const status = error?.response?.status;
        if (Number.isInteger(status)) {
          delayFlash(status in msgs ? msgs[status] : msgs.request, 'error');
        } else {
          console.error(error);
          delayFlash(msgs.error, 'error');
        }
      }
      await awaken;
      await sleep(0);
      setLoadCount(count => count - 1);
      doFlash();
    },
    [flash]
  );

  const loaderElem =
    loadCount > 0 || flashElem ? (
      <>
        {loadCount > 0 && <Spinner />}
        {flashElem}
      </>
    ) : null;
  return { loadData, loaderElem, flash };
}
