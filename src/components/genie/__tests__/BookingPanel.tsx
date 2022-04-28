import { h } from 'preact';
import FakeTimers from '@sinonjs/fake-timers';

import { GenieClientProvider } from '@/contexts/GenieClient';
import { displayTime } from '@/datetime';
import { click, render, screen } from '@/testing';
import { client, bookings } from '@/__fixtures__/genie';
import BookingPanel from '../BookingPanel';

const onClose = jest.fn();
const renderComponent = () =>
  render(
    <GenieClientProvider value={client}>
      <BookingPanel onClose={onClose} />
    </GenieClientProvider>
  );

describe('BookingPanel', () => {
  const clock = FakeTimers.install();

  it('renders booking panel', async () => {
    renderComponent();
    const lis = await screen.findAllByRole('listitem');
    lis.forEach((li, i) => {
      const { experience, start, end } = bookings[i];
      expect(li).toHaveTextContent(experience.name);
      expect(li).toHaveTextContent(displayTime(start.time));
      expect(li).toHaveTextContent(displayTime(end.time));
    });

    click('More');
    click('Back');

    click('More');
    click('Cancel');
    click('Select All');
    click('Cancel Reservation');
    await screen.findByText(bookings[1].experience.name);
    expect(
      screen.queryByText(bookings[0].experience.name)
    ).not.toBeInTheDocument();

    click('Close');
    click(screen.getByTestId('panel-shade'));
    clock.runToLast();
    expect(onClose).toBeCalledTimes(2);
  });

  it('renders empty booking panel', async () => {
    client.bookings.mockResolvedValueOnce([]);
    renderComponent();
    await screen.findByText('No current reservations');
  });
});
