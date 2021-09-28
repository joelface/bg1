import { h, render } from 'preact';

import { setDefaultTimeZone } from './datetime';
import { StoredToken } from './token';
import { fetchJson } from './fetch';
import { ApiClient, isVirtualQueueOrigin } from './virtual-queue';
import App from './components/App';

const { origin } = location;
if (isVirtualQueueOrigin(origin)) {
  document.head.innerHTML += `
    <meta name=viewport content="width=device-width, initial-scale=1, maximum-scale=1">
    <title>BG1</title>
  `;
  const { body } = document;
  body.className = 'bg-gray-50 text-black';
  // Used with "touch-action: manipulation" to disable double-tap zoom
  body.addEventListener('click', () => null);
  const accessToken = new StoredToken('bg1:accessToken');
  const client = new ApiClient(origin, fetchJson, () => accessToken.get());
  setDefaultTimeZone(
    {
      WDW: 'America/New_York',
      DL: 'America/Los_Angeles',
    }[client.resort]
  );
  render(<App accessToken={accessToken} client={client} />, body);
} else {
  location.href = 'https://joelface.github.io/bg1/start.html';
}
