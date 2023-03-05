import { booking, client, mickey, pluto } from '@/__fixtures__/genie';
import { RequestError } from '@/api/genie';
import { ClientProvider } from '@/contexts/Client';
import { click, loading, render, see } from '@/testing';

import CancelGuests from '../CancelGuests';

jest.useFakeTimers();

const { guests } = booking;
const onClose = jest.fn();
function renderComponent() {
  render(
    <ClientProvider value={client}>
      <CancelGuests booking={booking} onClose={onClose} />
    </ClientProvider>
  );
}

describe('CancelGuests', () => {
  beforeEach(() => {
    onClose.mockClear();
  });

  it('cancels reservation', async () => {
    renderComponent();
    click('Select All');
    click('Cancel Reservation');
    expect(client.cancelBooking).lastCalledWith(guests);
    await loading();
    expect(onClose).toBeCalledTimes(1);
  });

  it('cancels selected guests', async () => {
    renderComponent();
    click(mickey.name);
    click(pluto.name);
    click('Cancel Guests');
    expect(client.cancelBooking).lastCalledWith([guests[0], guests[2]]);
    await loading();
    expect(onClose).toBeCalledTimes(1);
  });

  it('shows error on failure', async () => {
    renderComponent();
    client.cancelBooking.mockRejectedValueOnce(
      new RequestError({ status: 0, data: {} })
    );
    click('Select All');
    click('Cancel Reservation');
    await loading();
    see('Network request failed');
  });
});
