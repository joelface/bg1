import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { AuthClient, AuthData } from '@/api/auth/client';

export default function LoginForm({
  resort,
  onLogin,
}: {
  resort: 'WDW' | 'DLR';
  onLogin: (data: AuthData) => void;
}): h.JSX.Element {
  const iframe = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframe.current) return;
    const authClient = new AuthClient(iframe.current, onLogin, resort);
    authClient.open();
    return () => authClient.close();
  }, [resort, onLogin, iframe]);

  return (
    <iframe
      title="Disney Login Form"
      ref={iframe}
      className="fixed top-0 left-0 w-full h-full border-0"
    />
  );
}
