import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  queryHelpers,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

export * from '@testing-library/react';

function getByTextOrTitle(container: HTMLElement, label: string) {
  const c = within(container);
  for (const query of [
    () => c.getByText(label),
    () => c.getByRole('button', { name: label }),
    () => c.getByLabelText(label),
    () => c.getByTitle(label),
    () => c.getAllByText(label)[0],
  ]) {
    try {
      const elem = query();
      if (elem) return elem;
    } catch {
      continue;
    }
  }
  const error = queryHelpers.getElementError(
    `Unable to find element with text/title: ${label}`,
    container
  );
  // Adjust the stack trace so Jest will show where the error is in the test
  error.stack = (error.stack || '')
    .split('\n')
    .filter(l => !l.includes(__filename))
    .join('\n');
  throw error;
}

export function click(labelOrElem: string | HTMLElement) {
  fireEvent.click(
    labelOrElem instanceof HTMLElement
      ? labelOrElem
      : getByTextOrTitle(document.body, labelOrElem)
  );
}

export async function loading() {
  await screen.findByLabelText('Loading…');
  act(() => {
    jest.advanceTimersByTime(500);
  });
  await waitFor(() =>
    expect(screen.queryByLabelText('Loading…')).not.toBeInTheDocument()
  );
}

export function setTime(time: string, relativeDays = 0) {
  let date = new Date(`2022-07-17T${time}-0400`);
  date = new Date(date.setDate(date.getDate() + relativeDays));
  jest.setSystemTime(date);
}

if (!HTMLElement.prototype.scroll) {
  HTMLElement.prototype.scroll = () => undefined;
}
export const elemScrollMock = jest.spyOn(HTMLElement.prototype, 'scroll');

const MK_BTMRR_COORDS = [28.4197486, -81.5845092] as const;
let globalCoords: readonly [number, number] | undefined = MK_BTMRR_COORDS;
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
