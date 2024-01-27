import { createRoot } from 'react-dom/client';

import { AuthStore } from './api/auth/store';
import App from './components/App';

main();

function main() {
  if (!document.body) {
    setTimeout(main, 100);
    return;
  }

  document.close();
  addViewportMeta();
  createAppRoot().render(<App authStore={new AuthStore('bg1.auth')} />);
}

function addViewportMeta() {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1, maximum-scale=1';
  document.head.appendChild(meta);
}

function createAppRoot() {
  return createRoot(document.body.appendChild(document.createElement('div')));
}
