import { click, render, screen } from '@/testing';
import useDisclaimer from '../useDisclaimer';

const Disclaimer = () => useDisclaimer();

describe('useDisclaimer()', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is accepted after Accept button clicked', () => {
    const { container } = render(<Disclaimer />);
    screen.getByText('Warning!');
    click('Accept');
    expect(container).toBeEmptyDOMElement();
    expect(localStorage.getItem('bg01.disclaimer.accepted')).toBe('1');
  });

  it('is accepted when bg01.disclaimer.accepted is set', () => {
    localStorage.setItem('bg01.disclaimer.accepted', '1');
    const { container } = render(<Disclaimer />);
    expect(container).toBeEmptyDOMElement();
  });
});
