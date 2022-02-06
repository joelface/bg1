import { h } from 'preact';
import { useCallback, useState } from 'preact/hooks';

type FlashType = 'alert' | 'error';

interface FlashProps {
  message: string;
  type?: FlashType;
}

export default function Flash({
  message,
  type,
}: FlashProps): h.JSX.Element | null {
  type ||= 'alert';
  const colors = { alert: 'bg-yellow-200', error: 'bg-red-200' };
  return message ? (
    <div
      role="alert"
      className={`fixed bottom-20 left-0 w-full p-2 font-semibold text-center ${colors[type]} text-gray-800`}
    >
      {message}
    </div>
  ) : null;
}

type Flash = (message: string, type?: FlashType) => void;

export function useFlash(): [h.JSX.Element, Flash] {
  const [timeoutId, setTimeoutId] = useState(0);
  const [flashElem, setFlashElem] = useState(<Flash message="" type="alert" />);

  const flash = useCallback(
    (message: string, type?: FlashType) => {
      clearTimeout(timeoutId);
      setFlashElem(<Flash message={message} type={type} />);
      if (message) {
        setTimeoutId(
          self.setTimeout(() => {
            setFlashElem(<Flash message="" type={type} />);
          }, 2500)
        );
      }
    },
    [timeoutId]
  );

  return [flashElem, flash];
}
