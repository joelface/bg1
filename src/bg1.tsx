import { createRoot } from 'react-dom/client';

import { AuthStore } from './api/auth/store';
import { GenieClient, isGenieOrigin } from './api/genie';
import { VQClient, isVirtualQueueOrigin } from './api/vq';
import App from './components/App';
import Merlock from './components/genie/Merlock';
import BGClient from './components/vq/BGClient';
import { Client } from './contexts/Client';
import { setDefaultTimeZone } from './datetime';

main();

function main() {
  if (!document.body) {
    setTimeout(main, 100);
    return;
  }
  const authStore = new AuthStore('bg1.auth');
  if (isVirtualQueueOrigin(origin)) {
    renderApp(new VQClient({ origin, authStore }), BGClient, authStore);
  } else if (isGenieOrigin(origin)) {
    GenieClient.load({ origin, authStore }).then(client =>
      renderApp(client, Merlock, authStore)
    );
  } else {
    location.href = 'https://kabb5.github.io/bg01/start.html';
  }
}

async function renderApp(
  apiClient: Client,
  ClientUI: React.FunctionComponent,
  authStore: AuthStore
) {
  setDefaultTimeZone(
    {
      WDW: 'America/New_York',
      DLR: 'America/Los_Angeles',
    }[apiClient.resort]
  );
  document.title = 'BG01';
  addViewportMeta();
  disableDoubleTapZoom();
  createReactRoot().render(
    <App client={apiClient} authStore={authStore}>
      <ClientUI />
    </App>
  );
}

function disableDoubleTapZoom() {
  document.body.addEventListener('click', () => null);
}

function addViewportMeta() {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1, maximum-scale=1';
  document.head.appendChild(meta);
}

function createReactRoot() {
  const rootElem = document.createElement('div');
  rootElem.id = 'app';
  document.body.appendChild(rootElem);
  return createRoot(rootElem);
}
