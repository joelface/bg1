import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { StoredToken, TokenStale } from '../token';
import { ApiClient } from '../virtual-queue';
import BGClient from './BGClient';
import Disclaimer, { useDisclaimer } from './Disclaimer';
import LoginForm from './LoginForm';
import WrongPage from './WrongPage';

export default function App({
  accessToken,
  client,
}: {
  accessToken: Public<StoredToken>;
  client: Public<ApiClient>;
}): h.JSX.Element | null {
  const [screenName, show] = useState<keyof typeof screens>('Blank');
  const [disclaimerAccepted, acceptDisclaimer] = useDisclaimer();

  useEffect(() => {
    if (location.origin !== 'https://vqguest-svc-wdw.wdprapps.disney.com') {
      return show('WrongPage');
    }

    if (!disclaimerAccepted) return show('Disclaimer');

    try {
      accessToken.get();
    } catch (e) {
      if (e instanceof TokenStale) return show('LoginForm');
      throw e;
    }
    show('BGClient');
  }, [accessToken, disclaimerAccepted]);

  function onLogin(token: string, expires: Date) {
    accessToken.set(token, expires);
    show('BGClient');
  }

  const screens = {
    Blank: <div />,
    WrongPage: <WrongPage />,
    Disclaimer: <Disclaimer onAccept={acceptDisclaimer} />,
    LoginForm: <LoginForm onLogin={onLogin} />,
    BGClient: <BGClient client={client} />,
  };

  return (
    <div className="max-w-2xl mx-auto px-3 py-2">{screens[screenName]}</div>
  );
}
