import { h } from 'preact';
import { render } from '@testing-library/preact';

import Clock from '../Clock';
import { dateTimeStrings } from '../../datetime';

describe('Clock', () => {
  it('shows current time', () => {
    const { container } = render(<Clock />);
    expect(container).toHaveTextContent(dateTimeStrings().time.slice(0, 8));
  });
});
