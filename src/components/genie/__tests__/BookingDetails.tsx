import { h } from 'preact';

import { GenieClientProvider } from '@/contexts/GenieClient';
import { click, render, screen, waitFor } from '@/testing';
import { client, booking } from '@/__fixtures__/genie';
import BookingDetails from '../BookingDetails';

const { guests } = booking;
const onClose = jest.fn();
const renderComponent = () =>
  render(
    <GenieClientProvider value={client}>
      <BookingDetails booking={booking} onClose={onClose} />
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
    expect(onClose).lastCalledWith(guests);
  });

  it('calls onClose if reservation canceled', async () => {
    renderComponent();
    click('Cancel');
    click('Select All');
    click('Cancel Reservation');
    await waitFor(() => expect(onClose).lastCalledWith([]));
  });
});
