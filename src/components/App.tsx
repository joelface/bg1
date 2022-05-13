import { h, Fragment, ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { AuthStore, ReauthNeeded } from '@/api/auth/store';
import useDisclaimer from '@/hooks/useDisclaimer';
import LoginForm from './LoginForm';

export default function App({
  resort,
  authStore,
  children,
}: {
  resort: 'WDW' | 'DLR';
  authStore: Public<AuthStore>;
  children: ComponentChildren;
}): h.JSX.Element | null {
  const [screenName, show] = useState<keyof typeof screens>('Blank');
  const disclaimer = useDisclaimer();

  useEffect(() => {
    function checkAuthData() {
      if (document.hidden) return;
      try {
        authStore.getData();
        show('Client');
      } catch (error) {
        if (error instanceof ReauthNeeded) {
          return show('LoginForm');
        } else {
          console.error(error);
        }
      }
    }

    checkAuthData();
    document.addEventListener('visibilitychange', checkAuthData);
    return () => {
      document.removeEventListener('visibilitychange', checkAuthData);
    };
  }, [authStore]);

  const screens = {
    Blank: <div />,
    LoginForm: (
      <LoginForm
        resort={resort}
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
