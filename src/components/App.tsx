import { useEffect, useState } from 'react';

import { AuthStore, ReauthNeeded } from '@/api/auth';
import { InvalidOrigin } from '@/api/client';
import { DasClient } from '@/api/das';
import { GenieClient } from '@/api/genie';
import { LiveDataClient } from '@/api/livedata';
import { Resort } from '@/api/resort';
import { VQClient } from '@/api/vq';
import { DasClientProvider } from '@/contexts/DasClient';
import { GenieClientProvider } from '@/contexts/GenieClient';
import { LiveDataClientProvider } from '@/contexts/LiveDataClient';
import { ResortProvider } from '@/contexts/Resort';
import { VQClientProvider } from '@/contexts/VQClient';
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
    (async () => {
      for (const [Client, Component] of [
        [GenieClient, Merlock],
        [VQClient, BGClient],
      ] as const) {
        try {
          const resort = await Client.originToResort(origin);
          setResort(resort);
          setDefaultTimeZone(
            {
              WDW: 'America/New_York',
              DLR: 'America/Los_Angeles',
            }[resort.id]
          );
          setContent(
            <ResortProvider value={resort}>
              <LiveDataClientProvider value={new LiveDataClient(resort)}>
                <GenieClientProvider value={new GenieClient(resort, authStore)}>
                  <DasClientProvider value={new DasClient(resort, authStore)}>
                    <VQClientProvider value={new VQClient(resort, authStore)}>
                      <Component />
                    </VQClientProvider>
                  </DasClientProvider>
                </GenieClientProvider>
              </LiveDataClientProvider>
            </ResortProvider>
          );
          return;
        } catch (error) {
          if (!(error instanceof InvalidOrigin)) throw error;
        }
      }
      location.assign('https://joelface.github.io/bg1/start.html');
    })();
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
