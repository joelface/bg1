import { createRoot } from 'react-dom/client';

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
  ClientUI: React.FunctionComponent
) {
  document.head.innerHTML += `
    <meta name=viewport content="width=device-width, initial-scale=1, maximum-scale=1">
    <title>BG1</title>
  `;
  document.body.innerHTML = '<div id=app><div>';
  setDefaultTimeZone(
    {
      WDW: 'America/New_York',
      DLR: 'America/Los_Angeles',
    }[apiClient.resort]
  );
  const rootElem = document.getElementById('app');
  if (!rootElem) return;
  const root = createRoot(rootElem);
  root.render(
    <ClientProvider value={apiClient}>
      <App authStore={authStore}>
        <ClientUI />
      </App>
    </ClientProvider>
  );
  disableDoubleTapZoom();
}

function disableDoubleTapZoom() {
  document.body.addEventListener('click', () => null);
}
