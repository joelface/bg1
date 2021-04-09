import { h, render } from 'preact';

import { StoredToken } from './token';
import { fetchJson } from './fetch';
import { ApiClient } from './virtual-queue';
import App from './components/App';

document.head.innerHTML += `
  <meta name=viewport content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>BG1</title>
`;
document.body.className = 'bg-gray-50 text-black';
const accessToken = new StoredToken('accessToken');
const client = new ApiClient(fetchJson, () => accessToken.get());
render(<App accessToken={accessToken} client={client} />, document.body);
