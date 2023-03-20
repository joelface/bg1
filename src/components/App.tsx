import { useEffect, useState } from 'react';

import { AuthStore } from '@/api/auth/store';
import { Client, ClientProvider } from '@/contexts/Client';
import useDisclaimer from '@/hooks/useDisclaimer';
import useNews from '@/hooks/useNews';
import onVisible from '@/onVisible';

import LoginForm from './LoginForm';

export const NEWS_VERSION = 1;

export default function App({
  client,
  authStore,
  children,
}: {
  client: Client;
  authStore: Public<AuthStore>;
  children: JSX.Element;
}) {
  const [screenName, show] = useState<keyof typeof screens>('blank');
  const disclaimer = useDisclaimer();
  const news = useNews(NEWS_VERSION);

  useEffect(() => {
    client.onUnauthorized = () => show('login');
  }, [client]);

  useEffect(() => {
    function checkAuth() {
      if (screenName === 'login') return;
      try {
        authStore.getData();
        show('client');
      } catch {
        return show('login');
      }
    }
    checkAuth();
    return onVisible(checkAuth);
  }, [authStore, screenName]);

  if (disclaimer) return disclaimer;
  if (news) return news;

  const screens = {
    blank: <div />,
    login: (
      <LoginForm
        resort={client.resort}
        onLogin={data => {
          authStore.setData(data);
          show('client');
        }}
      />
    ),
    client: children,
  };

  return <ClientProvider value={client}>{screens[screenName]}</ClientProvider>;
}
