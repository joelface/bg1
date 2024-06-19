import { useEffect, useState } from 'react';

import { ReauthNeeded, authStore } from '@/api/auth';
import { InvalidOrigin } from '@/api/client';
import { GenieClient } from '@/api/genie';
import { Resort, loadResort } from '@/api/resort';
import { VQClient } from '@/api/vq';
import { ResortProvider } from '@/contexts/Resort';
import { setDefaultTimeZone } from '@/datetime';
import useDisclaimer from '@/hooks/useDisclaimer';
import useNews from '@/hooks/useNews';
import onVisible from '@/onVisible';

import LoginForm from './LoginForm';
import Merlock from './genie/Merlock';
import BGClient from './vq/BGClient';

export const NEWS_VERSION = 0;

function disableDoubleTapZoom() {
  document.body.addEventListener('click', () => null);
}

export default function App() {
  const [resort, setResort] = useState<Resort>();
  const [content, setContent] = useState(<div />);
  const disclaimer = useDisclaimer();
  const news = useNews(NEWS_VERSION);
  const [loginRequired, requireLogin] = useState(() => {
    try {
      authStore.getData();
    } catch (e) {
      if (!(e instanceof ReauthNeeded)) throw e;
      return true;
    }
    return false;
  });

  useEffect(() => {
    disableDoubleTapZoom();
  }, []);

  useEffect(() => {
    authStore.onUnauthorized = () => requireLogin(true);
    (async () => {
      for (const [Client, Component] of [
        [GenieClient, Merlock],
        [VQClient, BGClient],
      ] as const) {
        try {
          const resort = await loadResort(Client.originToResortId(origin));
          setResort(resort);
          setDefaultTimeZone(
            {
              WDW: 'America/New_York',
              DLR: 'America/Los_Angeles',
            }[resort.id]
          );
          setContent(
            <ResortProvider value={resort}>
              <Component />
            </ResortProvider>
          );
          return;
        } catch (error) {
          if (!(error instanceof InvalidOrigin)) throw error;
        }
      }
      location.assign('https://joelface.github.io/bg1/start.html');
    })();
  }, []);

  useEffect(() => {
    function checkAuth() {
      if (loginRequired) return;
      try {
        authStore.getData();
        requireLogin(false);
      } catch {
        requireLogin(true);
      }
    }
    checkAuth();
    return onVisible(checkAuth);
  }, [loginRequired]);

  return (
    disclaimer ||
    news ||
    (loginRequired && resort && (
      <LoginForm
        resort={resort}
        onLogin={data => {
          authStore.setData(data);
          requireLogin(false);
        }}
      />
    )) ||
    content
  );
}
