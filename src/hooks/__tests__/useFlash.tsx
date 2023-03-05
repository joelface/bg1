import { act, click, render, see } from '@/testing';

import useFlash, { Flash } from '../useFlash';

jest.useFakeTimers();

describe('Flash', () => {
  it('shows alert message', () => {
    render(<Flash message="hi" type="alert" />);
    expect(see('hi')).toHaveClass('bg-yellow-200');
  });

  it('shows error message', () => {
    render(<Flash message="oops" type="error" />);
    expect(see('oops')).toHaveClass('bg-red-200');
  });

  it('renders null when no message', () => {
    const { container } = render(<Flash message="" type="alert" />);
    expect(container).toBeEmptyDOMElement();
  });
});

function UseFlashExample() {
  const [flashElem, flash] = useFlash();
  return (
    <div>
      {flashElem}
      <button onClick={() => flash('hi')}>Alert</button>
      <button onClick={() => flash('oops', 'error')}>Error</button>
    </div>
  );
}

describe('useFlash()', () => {
  it('flashes message when triggered', async () => {
    render(<UseFlashExample />);
    see.no('hi');
    see.no('oops');

    click('Alert');
    expect(see('hi')).toHaveClass('bg-yellow-200');

    click('Error');
    expect(see('oops')).toHaveClass('bg-red-200');
    act(() => {
      jest.runOnlyPendingTimers();
    });
    see.no('oops');
  });
});
