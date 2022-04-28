import { h, render, ComponentType, Provider } from 'preact';

import { AuthStore } from './api/auth/store';
import { GenieClient, isGenieOrigin } from './api/genie';
import { VQClient, isVirtualQueueOrigin } from './api/vq';
import App from './components/App';
import TipBoard from './components/genie/TipBoard';
import BGClient from './components/vq/BGClient';
import { setDefaultTimeZone } from './datetime';
import { GenieClientProvider } from './contexts/GenieClient';
import { VQClientProvider } from './contexts/VQClient';

const authStore = new AuthStore('bg1.auth');
const getAuthData = () => authStore.getData();
if (isVirtualQueueOrigin(origin)) {
  renderApp(new VQClient({ origin, getAuthData }), BGClient, VQClientProvider);
} else if (isGenieOrigin(origin)) {
  GenieClient.load({ origin, getAuthData }).then(client =>
    renderApp(client, TipBoard, GenieClientProvider)
  );
} else {
  location.href = 'https://joelface.github.io/bg1/start.html';
}

async function renderApp<T extends { resort: 'WDW' | 'DLR' }>(
  apiClient: T,
  ClientUI: ComponentType,
  Provider: Provider<T>
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
    <App resort={apiClient.resort} authStore={authStore}>
      <Provider value={apiClient}>
        <ClientUI />
      </Provider>
    </App>,
    document.body
  );
  disableDoubleTapZoom();
}

function disableDoubleTapZoom() {
  document.body.addEventListener('click', () => null);
}
