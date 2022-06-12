import { render, screen, waitFor } from '/testing';
import Clock from '../Clock';

jest.mock('/datetime', () => {
  return {
    dateTimeStrings: () => ({ date: '2020-04-05', time: '12:59:47' }),
  };
});

self.time_is_widget = { init: jest.fn() };
const onSync = jest.fn();

describe('Clock', () => {
  it('shows current time', async () => {
    const id = 'Orlando_z161';
    render(<Clock id={id} onSync={onSync} />);
    expect(screen.getByText('12:59:47')).toHaveAttribute('id', id);
    expect(self.time_is_widget.init).lastCalledWith({ [id]: {} });
    // Fake clock syncing
    (document.getElementById(id) as HTMLElement).innerHTML =
      '<span>12:59:48</span>';
    await waitFor(() => expect(onSync).toBeCalled());
  });
});
