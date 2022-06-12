import { RequestError } from '/api/genie';
import { ClientProvider } from '/contexts/Client';
import { click, render, screen, waitFor } from '/testing';
import { client, booking, mickey, minnie, pluto } from '/__fixtures__/genie';
import CancelGuests from '../CancelGuests';

jest.useFakeTimers();

const { guests } = booking;
const onClose = jest.fn();
const renderComponent = () =>
  render(
    <ClientProvider value={client}>
      <CancelGuests booking={booking} onClose={onClose} />
    </ClientProvider>
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
    click(mickey.name);
    click(pluto.name);
    click('Cancel Guests');
    expect(client.cancelBooking).lastCalledWith([guests[0], guests[2]]);
    await waitFor(() => expect(onClose).lastCalledWith([guests[1]]));
  });

  it('cancels nothing', async () => {
    renderComponent();
    click('Select All');
    click(mickey.name);
    click(minnie.name);
    click(pluto.name);
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
