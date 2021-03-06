import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';

import Disclaimer, { useDisclaimer } from '../Disclaimer';

const { getByRole } = screen;

describe('Disclaimer', () => {
  it('calls onAccept when button clicked', () => {
    const onAccept = jest.fn();
    render(<Disclaimer onAccept={onAccept} />);
    fireEvent.click(getByRole('button'));
    expect(onAccept).toBeCalledTimes(1);
  });
});

function UseDisclaimerExample(): h.JSX.Element {
  const [accepted, accept] = useDisclaimer();
  return (
    <div>
      <p>{accepted ? 'is-accepted' : 'not-accepted'}</p>
      <button onClick={accept}>Accept</button>
    </div>
  );
}

describe('useDisclaimer()', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is accepted after calling accept()', () => {
    const { container } = render(<UseDisclaimerExample />);
    expect(container).toHaveTextContent('not-accepted');
    fireEvent.click(getByRole('button'));
    expect(container).toHaveTextContent('is-accepted');
    expect(localStorage.getItem('disclaimerAccepted')).toBe('1');
  });

  it('is accepted when disclaimerAccepted is set', () => {
    localStorage.setItem('disclaimerAccepted', '1');
    const { container } = render(<UseDisclaimerExample />);
    expect(container).toHaveTextContent('is-accepted');
  });
});
