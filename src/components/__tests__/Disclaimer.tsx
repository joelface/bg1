import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';

import Disclaimer, { useDisclaimer } from '../Disclaimer';

describe('Disclaimer', () => {
  it('calls onAccept when button clicked', () => {
    const onAccept = jest.fn();
    render(<Disclaimer onAccept={onAccept} />);
    fireEvent.click(screen.getByText('Accept'));
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
    fireEvent.click(screen.getByText('Accept'));
    expect(container).toHaveTextContent('is-accepted');
    expect(localStorage.getItem('bg1:disclaimerAccepted')).toBe('1');
  });

  it('is accepted when bg1:disclaimerAccepted is set', () => {
    localStorage.setItem('bg1:disclaimerAccepted', '1');
    const { container } = render(<UseDisclaimerExample />);
    expect(container).toHaveTextContent('is-accepted');
  });
});
