import '@testing-library/jest-dom';
import {
  ByRoleMatcher,
  ByRoleOptions,
  act,
  fireEvent,
  queryHelpers,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';

export * from '@testing-library/react';

export const YESTERDAY = '2021-09-30';
export const TODAY = '2021-10-01';
export const TOMORROW = '2021-10-02';

function getQueryError(message: string) {
  const error = queryHelpers.getElementError(message, getContainerElem());
  // Adjust the stack trace so Jest will show where the error is in the test
  error.stack = (error.stack || '')
    .split('\n')
    .filter(l => !l.includes(__filename))
    .join('\n');
  return error;
}

const getTextError = (text: string) =>
  getQueryError(`Unable to find element with text: ${text}`);

const withinActive = () =>
  within(
    document.querySelector<HTMLElement>('article:not([hidden])') ??
      document.body
  );

const getContainerElem = () =>
  document.querySelector<HTMLElement>('article:not([hidden])') ?? document.body;

export const see = Object.assign(
  (text: string, role?: ByRoleMatcher, options?: ByRoleOptions) => {
    if (role) {
      try {
        return screen.getByRole(role, { ...options, name: text });
      } catch {
        // pass through
      }
    } else {
      const c = withinActive();
      for (const q of [c.getByText, c.getByTitle]) {
        try {
          return q(text);
        } catch {
          continue;
        }
      }
    }
    throw getTextError(text);
  },
  {
    all(text: string) {
      const c = within(getContainerElem());
      try {
        return [...c.queryAllByText(text), ...c.queryAllByTitle(text)];
      } catch {
        throw getTextError(text);
      }
    },
    no(text: string, role?: ByRoleMatcher) {
      const active = within(getContainerElem());
      try {
        return expect(
          role
            ? active.queryByRole(role, { name: text })
            : active.queryByText(text)
        ).not.toBeInTheDocument();
      } catch {
        throw getQueryError(`Found element with text: ${text}`);
      }
    },
    async screen(title: string) {
      try {
        await screen.findByRole('heading', { name: title, level: 1 });
      } catch {
        throw getQueryError(`Unable to find screen with title: ${title}`);
      }
    },
  }
);

export function click(textOrElem: string | HTMLElement, role?: ByRoleMatcher) {
  let elem: HTMLElement | undefined;
  if (textOrElem instanceof HTMLElement) {
    elem = textOrElem;
  } else {
    try {
      elem = see(textOrElem, role);
    } catch (error) {
      if (!role) {
        elem = see(textOrElem, 'button');
      } else {
        throw error;
      }
    }
  }
  if (elem) fireEvent.click(elem);
}

export async function loading() {
  try {
    await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading…'), {
      timeout: 5000,
    });
  } catch {
    throw getQueryError("Didn't show loading spinner");
  }
}

export function setTime(time: string, minutes = 0) {
  const now = new Date(`${TODAY}T${time}-0400`);
  jest.useFakeTimers({ now });
  if (minutes) jest.advanceTimersByTime(minutes * 60_000);
}

Element.prototype.scroll ??= () => undefined;
Element.prototype.scrollIntoView ??= () => undefined;

const MK_DUMBO_COORDS = [28.4206047, -81.5789092] as const;
let globalCoords: readonly [number, number] | undefined = MK_DUMBO_COORDS;
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition(onSuccess: any, onError: any) {
      if (globalCoords) {
        onSuccess({
          coords: { latitude: globalCoords[0], longitude: globalCoords[1] },
        });
      } else {
        onError({ code: 2, message: 'Position unavailable' });
      }
    },
  },
});

export async function withCoords(
  coords: typeof globalCoords | undefined,
  callback: () => void | Promise<void>
) {
  const origCoords = globalCoords;
  globalCoords = coords;
  await callback();
  globalCoords = origCoords;
}

let hidden = false;
Object.defineProperty(document, 'hidden', { get: () => hidden });

export function toggleVisibility() {
  hidden = !hidden;
  document.dispatchEvent(new Event('visibilitychange'));
}

export function revisitTab(delaySec = 60) {
  act(() => {
    toggleVisibility();
    jest.advanceTimersByTime(delaySec * 1000);
    toggleVisibility();
  });
}
