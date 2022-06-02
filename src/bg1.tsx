import { h, render, ComponentType } from 'preact';

import { AuthStore } from './api/auth/store';
import { GenieClient, isGenieOrigin } from './api/genie';
import { VQClient, isVirtualQueueOrigin } from './api/vq';
import App from './components/App';
import TipBoard from './components/genie/TipBoard';
import BGClient from './components/vq/BGClient';
import { Client, ClientProvider } from './contexts/Client';
import { setDefaultTimeZone } from './datetime';

const authStore = new AuthStore('bg1.auth');
if (isVirtualQueueOrigin(origin)) {
  renderApp(new VQClient({ origin, authStore }), BGClient);
} else if (isGenieOrigin(origin)) {
  GenieClient.load({ origin, authStore }).then(client =>
    renderApp(client, TipBoard)
  );
} else {
  location.href = 'https://joelface.github.io/bg1/start.html';
}

async function renderApp<T extends Client>(
  apiClient: T,
  ClientUI: ComponentType
) {
  document.head.innerHTML += `
    <meta name=viewport content="width=device-width, initial-scale=1, maximum-scale=1">
    <title>BG1</title>
  `;
  setDefaultTimeZone(
    {
      WDW: 'America/New_York',
      DLR: 'America/Los_Angeles',
    }[apiClient.resort]
  );
  render(
    <ClientProvider value={apiClient}>
      <App authStore={authStore}>
        <ClientUI />
      </App>
    </ClientProvider>,
    document.body
  );
  disableDoubleTapZoom();
}

function disableDoubleTapZoom() {
  document.body.addEventListener('click', () => null);
}
