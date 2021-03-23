import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { AuthClient } from '../auth-client';

interface Props {
  onLogin: (token: string, expires: Date) => void;
}

export default function LoginForm({ onLogin }: Props): h.JSX.Element {
  const iframe = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!iframe.current) return;
    const authClient = new AuthClient(iframe.current, onLogin);
    authClient.open();
    return () => authClient.close();
  }, [iframe, onLogin]);

  return (
    <iframe
      ref={iframe}
      className="fixed top-0 left-0 w-full h-full border-0"
    />
  );
}
