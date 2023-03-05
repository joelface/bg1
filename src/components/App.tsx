import { useEffect, useState } from 'react';

import { AuthStore } from '@/api/auth/store';
import { Client, ClientProvider } from '@/contexts/Client';
import useDisclaimer from '@/hooks/useDisclaimer';
import onVisible from '@/onVisible';

import LoginForm from './LoginForm';

export default function App({
  client,
  authStore,
  children,
}: {
  client: Client;
  authStore: Public<AuthStore>;
  children: JSX.Element;
}) {
  const [screenName, show] = useState<keyof typeof screens>('Blank');
  const disclaimer = useDisclaimer();

  useEffect(() => {
    client.onUnauthorized = () => show('LoginForm');
  }, [client]);

  useEffect(() => {
    function checkAuth() {
      if (screenName === 'LoginForm') return;
      try {
        authStore.getData();
        show('Client');
      } catch {
        return show('LoginForm');
      }
    }
    checkAuth();
    return onVisible(checkAuth);
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
