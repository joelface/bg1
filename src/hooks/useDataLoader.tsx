import { useCallback } from 'react';

import { RequestError } from '/api/genie';
import useFlash from './useFlash';
import useSpinner from './useSpinner';

export default function useDataLoader(): {
  loaderElem: React.ReactNode;
  loadData: typeof loadData;
  isLoading: boolean;
} {
  const [spinner, showSpinner] = useSpinner();
  const isLoading = !!spinner;
  const [flashElem, flashMsg] = useFlash();

  const loadData = useCallback(
    async (
      callback: (flash: typeof flashMsg) => Promise<void>,
      messages?: {
        error?: string;
        request?: string;
        [status: number]: string;
      }
    ) => {
      const msgs: {
        error: string;
        request: string;
        [status: number]: string;
      } = {
        error: 'Unknown error occurred',
        request: 'Network request failed',
        ...messages,
      };
      flashMsg('');

      let doFlash: () => void = () => null;
      const completion = new Promise(resolve => {
        doFlash = () => resolve(null);
      });

      async function delayFlash(...args: Parameters<typeof flashMsg>) {
        await completion;
        flashMsg(...args);
      }

      await showSpinner(async () => {
        try {
          await callback(delayFlash);
        } catch (error) {
          if (error instanceof RequestError) {
            const { status } = error.response;
            delayFlash(status in msgs ? msgs[status] : msgs.request, 'error');
          } else {
            console.error(error);
            delayFlash(msgs.error, 'error');
          }
        }
      });
      doFlash();
    },
    [showSpinner, flashMsg]
  );

  const loaderElem = (
    <>
      {flashElem}
      {spinner}
    </>
  );
  return { loadData, loaderElem, isLoading };
}
