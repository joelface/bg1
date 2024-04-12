import kvdb from '@/kvdb';
import { click, render, see } from '@/testing';

import useDisclaimer, { DISCLAIMER_ACCEPTED_KEY } from '../useDisclaimer';

const Disclaimer = () => useDisclaimer();

describe('useDisclaimer()', () => {
  beforeEach(() => {
    kvdb.clear();
  });

  it('is accepted after Accept button clicked', () => {
    const { container } = render(<Disclaimer />);
    see('Warning!');
    click('Accept');
    expect(container).toBeEmptyDOMElement();
    expect(kvdb.get(DISCLAIMER_ACCEPTED_KEY)).toBe(1);
  });

  it('is accepted when bg1.disclaimer.accepted is set', () => {
    kvdb.set(DISCLAIMER_ACCEPTED_KEY, 1);
    const { container } = render(<Disclaimer />);
    expect(container).toBeEmptyDOMElement();
  });
});
