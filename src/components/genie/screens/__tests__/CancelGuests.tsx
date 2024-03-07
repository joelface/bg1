import { booking, client, mickey, pluto } from '@/__fixtures__/genie';
import { RequestError } from '@/api/client';
import { GenieClientProvider } from '@/contexts/GenieClient';
import { click, loading, render, see } from '@/testing';

import CancelGuests from '../CancelGuests';

jest.useFakeTimers();

const { guests } = booking;
const onCancel = jest.fn();

function renderComponent() {
  render(
    <GenieClientProvider value={client}>
      <CancelGuests booking={booking} onCancel={onCancel} />
    </GenieClientProvider>
  );
}

describe('CancelGuests', () => {
  beforeEach(() => {
    onCancel.mockClear();
  });

  it('cancels reservation', async () => {
    renderComponent();
    click('Select All');
    click('Cancel Reservation');
    expect(client.cancelBooking).toHaveBeenLastCalledWith(guests);
    await loading();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('cancels selected guests', async () => {
    renderComponent();
    click(mickey.name);
    click(pluto.name);
    click('Cancel Guests');
    expect(client.cancelBooking).toHaveBeenLastCalledWith([
      guests[0],
      guests[2],
    ]);
    await loading();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows error on failure', async () => {
    renderComponent();
    client.cancelBooking.mockRejectedValueOnce(
      new RequestError({ ok: false, status: 0, data: {} })
    );
    click('Select All');
    click('Cancel Reservation');
    await loading();
    see('Network request failed');
  });
});
