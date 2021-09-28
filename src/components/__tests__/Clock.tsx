import { h } from 'preact';
import { render } from '@testing-library/preact';

import Clock from '../Clock';

jest.mock('../../datetime', () => {
  return {
    dateTimeStrings: () => ({ date: '2020-04-05', time: '12:59:47.328' }),
  };
});

self.time_is_widget = { init: jest.fn() };

describe('Clock', () => {
  it('shows current time', () => {
    const id = 'Orlando_z161';
    const { container } = render(<Clock id={id} />);
    expect(container).toHaveTextContent('12:59:47');
    expect(container.querySelector('time')?.id).toBe(id);
    expect(self.time_is_widget.init).lastCalledWith({ [id]: {} });
  });
});
