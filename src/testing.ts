import '@testing-library/jest-dom';
import { fireEvent, queryHelpers, within } from '@testing-library/preact';

export * from '@testing-library/preact';

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

export function setTime(time: string, relativeDays = 0) {
  let date = new Date(`2022-07-17T${time}-0400`);
  date = new Date(date.setDate(date.getDate() + relativeDays));
  jest.spyOn(Date, 'now').mockReturnValue(date.getTime());
}

if (!HTMLElement.prototype.scroll) {
  HTMLElement.prototype.scroll = () => undefined;
}
export const elemScrollMock = jest.spyOn(HTMLElement.prototype, 'scroll');
