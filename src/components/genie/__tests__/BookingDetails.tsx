import { h } from 'preact';

import { Booking } from '@/api/genie';
import { GenieClientProvider } from '@/contexts/GenieClient';
import { click, render, screen, waitFor } from '@/testing';
import { client, booking, multiExp } from '@/__fixtures__/genie';
import BookingDetails from '../BookingDetails';
import { displayTime } from '@/datetime';

const onClose = jest.fn();
const renderComponent = (b: Booking = booking) =>
  render(
    <GenieClientProvider value={client}>
      <BookingDetails booking={b} onClose={onClose} />
    </GenieClientProvider>
  );

describe('BookingDetails', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders booking details', () => {
    const { container } = renderComponent();
    expect(container).toHaveTextContent('11:25 AM - 12:25 PM');
    screen.getByText('Mickey Mouse');
    screen.getByText('Minnie Mouse');
    screen.getByText('Pluto');
    click('Cancel');
    screen.getByText('Select Guests to Cancel');
    click('Back');
    click('Back');
    expect(onClose).lastCalledWith(booking.guests);
  });

  it('calls onClose if reservation canceled', async () => {
    renderComponent();
    click('Cancel');
    click('Select All');
    click('Cancel Reservation');
    await waitFor(() => expect(onClose).lastCalledWith([]));
  });

  it('shows Multiple Experiences LL details', async () => {
    const { container } = renderComponent(multiExp);
    screen.getByText('Multiple Experiences');
    expect(container).toHaveTextContent(
      `${displayTime(multiExp.start.time)} - Park Close`
    );
    multiExp.choices.forEach(({ name }) => {
      screen.getByText(name);
    });
    expect(screen.getAllByText('Redemptions left: 1')).toHaveLength(
      multiExp.guests.length
    );
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument();
  });
});
