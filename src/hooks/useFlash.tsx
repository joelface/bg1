import { useCallback, useState } from 'react';

type FlashType = 'alert' | 'error';

const DEFAULT_DURATION_MS = 3000;
const COLORS = { alert: 'bg-yellow-200', error: 'bg-red-200' };

export default function useFlash(): [React.ReactNode, typeof flash] {
  const [, setTimeoutId] = useState(0);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<FlashType>('alert');

  const flash = useCallback((message: string, type?: FlashType) => {
    setMessage(message);
    setType(type || 'alert');
    setTimeoutId(timeoutId => {
      clearTimeout(timeoutId);
      return message
        ? self.setTimeout(() => {
            setMessage('');
          }, DEFAULT_DURATION_MS)
        : timeoutId;
    });
  }, []);
  const flashElem = <Flash message={message} type={type} />;
  return [flashElem, flash];
}

export function Flash({ message, type }: { message: string; type: FlashType }) {
  return message ? (
    <div
      role="alert"
      className={`fixed bottom-20 left-0 w-full p-2 font-semibold text-center ${COLORS[type]} text-gray-800`}
    >
      {message}
    </div>
  ) : null;
}
