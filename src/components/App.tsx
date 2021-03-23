import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { StoredToken, TokenStale } from '../token';
import { ApiClient } from '../virtual-queue';
import BGClient from './BGClient';
import LoginForm from './LoginForm';

interface Props {
  accessToken: StoredToken;
  client: ApiClient;
}

export default function App({
  accessToken,
  client,
}: Props): h.JSX.Element | null {
  const [screenName, show] = useState<keyof typeof screens>('Blank');

  useEffect(() => {
    try {
      accessToken.get();
    } catch (e) {
      if (e instanceof TokenStale) return show('LoginForm');
      throw e;
    }
    show('BGClient');
  }, [accessToken]);

  function onLogin(token: string, expires: Date) {
    accessToken.set(token, expires);
    show('BGClient');
  }

  const screens = {
    Blank: <div />,
    LoginForm: <LoginForm onLogin={onLogin} />,
    BGClient: <BGClient client={client} />,
  };

  return (
    <div className="max-w-2xl mx-auto px-3 py-2">{screens[screenName]}</div>
  );
}
