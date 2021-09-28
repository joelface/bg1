import { h } from 'preact';
import { render } from '@testing-library/preact';

import TimeBoard from '../TimeBoard';

jest.mock('../Clock', () => {
  const Clock = () => <time>12:59:55</time>;
  return Clock;
});

describe('TimeBoard', () => {
  it('shows next queue open time and current time', () => {
    const { container } = render(
      <TimeBoard city="Orlando" queue={{ nextScheduledOpenTime: '13:00:00' }} />
    );
    expect(container).toHaveTextContent(/Next queue opening:\s*13:00:00/);
    expect(container).toHaveTextContent(/Current time:\s*12:59:55/);
  });
});
