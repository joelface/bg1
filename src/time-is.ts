declare global {
  interface Window {
    time_is_widget: {
      init: (clocks: any) => void;
    };
  }
}

const WIDGET_SCRIPT_URL = 'https://widget.time.is/t.js';

function loadScript() {
  if ([...document.scripts].some(s => s.src === WIDGET_SCRIPT_URL)) return;
  const script = document.createElement('script');
  script.src = WIDGET_SCRIPT_URL;
  script.onload = reinit;
  document.head.appendChild(script);
}

const initArg: Record<string, unknown> = {};

function reinit() {
  if ('time_is_widget' in self) {
    self.time_is_widget.init(initArg);
  }
}

export function add(id: string): void {
  loadScript();
  initArg[id] = {};
  reinit();
}

export function remove(id: string): void {
  delete initArg[id];
  reinit();
}

export function clear(): void {
  for (const id of Object.keys(initArg)) delete initArg[id];
  reinit();
}
