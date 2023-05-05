import { useEffect, useState } from 'react';

import { AuthStore, ReauthNeeded } from '@/api/auth/store';
import { InvalidOrigin } from '@/api/client';
import { Resort, loadResortData } from '@/api/data';
import { GenieClient } from '@/api/genie';
import { VQClient } from '@/api/vq';
import { GenieClientProvider } from '@/contexts/GenieClient';
import { ResortDataProvider } from '@/contexts/ResortData';
import { VQClientProvider } from '@/contexts/VQClient';
import { setDefaultTimeZone } from '@/datetime';
import useDisclaimer from '@/hooks/useDisclaimer';
import useNews from '@/hooks/useNews';
import onVisible from '@/onVisible';

import LoginForm from './LoginForm';
import Merlock from './genie/Merlock';
import BGClient from './vq/BGClient';

export const NEWS_VERSION = 1;

function disableDoubleTapZoom() {
  document.body.addEventListener('click', () => null);
}

export default function App({ authStore }: { authStore: Public<AuthStore> }) {
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

    for (const [Client, Component] of [
      [GenieClient, Merlock],
      [VQClient, BGClient],
    ] as const) {
      try {
        const resort = Client.originToResort(origin);
        setResort(resort);
        setDefaultTimeZone(
          {
            WDW: 'America/New_York',
            DLR: 'America/Los_Angeles',
          }[resort]
        );
        loadResortData(resort).then(data => {
          setContent(
            <ResortDataProvider value={data}>
              <GenieClientProvider value={new GenieClient(data, authStore)}>
                <VQClientProvider value={new VQClient(data, authStore)}>
                  <Component />
                </VQClientProvider>
              </GenieClientProvider>
            </ResortDataProvider>
          );
        });
        return;
      } catch (e) {
        if (!(e instanceof InvalidOrigin)) throw e;
      }
    }
    location.href = 'https://joelface.github.io/bg1/start.html';
  }, [authStore]);

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
  }, [authStore, loginRequired]);

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
