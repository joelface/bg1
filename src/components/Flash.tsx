import { h } from 'preact';
import { useState } from 'preact/hooks';

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

export function useFlash(): [FlashProps, Flash] {
  const [timeoutId, setTimeoutId] = useState(0);
  const [flashProps, setFlashProps] = useState<FlashProps>({
    message: '',
    type: 'alert',
  });

  function flash(message: string, type?: FlashType) {
    clearTimeout(timeoutId);
    setFlashProps({ message, type });
    if (message) {
      setTimeoutId(
        self.setTimeout(() => {
          setFlashProps({ message: '', type });
        }, 2500)
      );
    }
  }

  return [flashProps, flash];
}
