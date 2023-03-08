import { useEffect, useState } from 'react';

import { AuthStore } from '@/api/auth/store';
import { Client, ClientProvider } from '@/contexts/Client';
import useDisclaimer from '@/hooks/useDisclaimer';

import LoginForm from './LoginForm';

export default function App({
  client,
  authStore,
  children,
}: {
  client: Client;
  authStore: Public<AuthStore>;
  children: React.ReactNode;
}) {
  const [screenName, show] = useState<keyof typeof screens>('Blank');
  const disclaimer = useDisclaimer();

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

  return (
    <ClientProvider value={client}>
      {disclaimer ? disclaimer : screens[screenName]}
    </ClientProvider>
  );
}
