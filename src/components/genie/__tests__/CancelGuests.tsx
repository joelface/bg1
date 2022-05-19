import { h } from 'preact';

import { GenieClientProvider } from '@/contexts/GenieClient';
import { click, render, screen, waitFor } from '@/testing';
import { client, booking } from '@/__fixtures__/genie';
import CancelGuests from '../CancelGuests';
import { RequestError } from '@/api/genie';

const { guests } = booking;
const onClose = jest.fn();
const renderComponent = () =>
  render(
    <GenieClientProvider value={client}>
      <CancelGuests booking={booking} onClose={onClose} />
    </GenieClientProvider>
  );

describe('CancelGuests', () => {
  beforeEach(() => {
    onClose.mockClear();
  });

  it('cancels reservation', async () => {
    renderComponent();
    click('Select All');
    click('Cancel Reservation');
    expect(client.cancelBooking).lastCalledWith(guests);
    await waitFor(() => expect(onClose).lastCalledWith([]));
  });

  it('cancels selected guests', async () => {
    renderComponent();
    click('Mickey Mouse');
    click('Pluto');
    click('Cancel Guests');
    expect(client.cancelBooking).lastCalledWith([guests[0], guests[2]]);
    await waitFor(() => expect(onClose).lastCalledWith([guests[1]]));
  });

  it('cancels nothing', async () => {
    renderComponent();
    click('Select All');
    click('Mickey Mouse');
    click('Minnie Mouse');
    click('Pluto');
    click('Back');
    await waitFor(() => expect(onClose).lastCalledWith(guests));

    click('Select All');
    click('Select All');
    click('Back');
    await waitFor(() => expect(onClose).lastCalledWith(guests));
  });

  it('shows error on failure', async () => {
    renderComponent();
    client.cancelBooking.mockRejectedValueOnce(
      new RequestError({ status: 0, data: {} })
    );
    click('Select All');
    click('Cancel Reservation');
    await screen.findByText('Network request failed');
  });
});
