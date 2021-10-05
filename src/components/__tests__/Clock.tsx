import { h } from 'preact';
import { render, screen } from '@testing-library/preact';

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
    render(<Clock id={id} />);
    expect(screen.getByText('12:59:47')).toHaveAttribute('id', id);
    expect(self.time_is_widget.init).lastCalledWith({ [id]: {} });
  });
});
