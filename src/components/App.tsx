import { h, Fragment, ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { AuthStore } from '@/api/auth/store';
import useDisclaimer from '@/hooks/useDisclaimer';
import LoginForm from './LoginForm';
import { useClient } from '@/contexts/Client';

export default function App({
  authStore,
  children,
}: {
  authStore: Public<AuthStore>;
  children: ComponentChildren;
}): h.JSX.Element | null {
  const [screenName, show] = useState<keyof typeof screens>('Blank');
  const disclaimer = useDisclaimer();
  const client = useClient();

  useEffect(() => {
    client.onUnauthorized = () => show('LoginForm');
  }, [client]);

  useEffect(() => {
    function checkAuthData() {
      if (document.hidden || screenName === 'LoginForm') return;
      try {
        authStore.getData();
        show('Client');
      } catch {
        return show('LoginForm');
      }
    }

    checkAuthData();
    document.addEventListener('visibilitychange', checkAuthData);
    return () => {
      document.removeEventListener('visibilitychange', checkAuthData);
    };
  }, [authStore, screenName]);

  const screens = {
    Blank: <div />,
    LoginForm: (
      <LoginForm
        resort={client.resort}
        onLogin={data => {
          authStore.setData(data);
          show('Client');
        }}
      />
    ),
    Client: children,
  };

  return <>{disclaimer ? disclaimer : screens[screenName]}</>;
}
