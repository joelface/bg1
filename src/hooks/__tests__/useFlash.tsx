import { act, click, render, screen, waitFor } from '/testing';
import useFlash, { Flash } from '../useFlash';

jest.useFakeTimers();

describe('Flash', () => {
  it('shows alert message', () => {
    render(<Flash message="hi" type="alert" />);
    expect(screen.getByText('hi')).toHaveClass('bg-yellow-200');
  });

  it('shows error message', () => {
    render(<Flash message="oops" type="error" />);
    expect(screen.getByText('oops')).toHaveClass('bg-red-200');
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
    expect(screen.queryByText('hi')).not.toBeInTheDocument();
    expect(screen.queryByText('oops')).not.toBeInTheDocument();

    click('Alert');
    expect(screen.getByText('hi')).toHaveClass('bg-yellow-200');

    click('Error');
    expect(screen.getByText('oops')).toHaveClass('bg-red-200');
    act(() => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() =>
      expect(screen.queryByText('oops')).not.toBeInTheDocument()
    );
  });
});
