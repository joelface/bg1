import { h } from 'preact';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';

import Flash, { useFlash } from '../Flash';

const { getByRole, queryByRole } = screen;

describe('Flash', () => {
  it('shows alert message', () => {
    render(<Flash message="hi" />);
    const elem = getByRole('alert');
    expect(elem).toHaveTextContent('hi');
    expect(elem.className).toContain('yellow');
  });

  it('shows error message', () => {
    render(<Flash message="oops" type="error" />);
    const elem = getByRole('alert');
    expect(elem).toHaveTextContent('oops');
    expect(elem.className).toContain('red');
  });

  it('renders null when no message', () => {
    render(<Flash message="" />);
    expect(queryByRole('alert')).toBeNull();
  });
});

function UseFlashExample(): h.JSX.Element {
  const [flashProps, flash] = useFlash();
  return (
    <div>
      <Flash {...flashProps} />
      <button onClick={() => flash('hi')}>Alert</button>
      <button onClick={() => flash('oops', 'error')}>Error</button>
    </div>
  );
}

describe('useFlash()', () => {
  it('flashes message when triggered', async () => {
    jest.useFakeTimers();
    render(<UseFlashExample />);
    expect(queryByRole('alert')).toBeNull();

    fireEvent.click(getByRole('button', { name: 'Alert' }));
    const elem = getByRole('alert');
    expect(elem).toHaveTextContent('hi');
    expect(elem.className).toContain('yellow');

    fireEvent.click(getByRole('button', { name: 'Error' }));
    expect(elem).toHaveTextContent('oops');
    expect(elem.className).toContain('red');
    await waitFor(() => expect(queryByRole('alert')).toBeNull());
  });
});
