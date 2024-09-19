import { booking, ll, mickey, pluto, renderResort } from '@/__fixtures__/ll';
import { RequestError } from '@/api/client';
import { click, loading, see } from '@/testing';

import CancelGuests from '../CancelGuests';

jest.useFakeTimers();

const { guests } = booking;
const onCancel = jest.fn();

function renderComponent() {
  renderResort(<CancelGuests booking={booking} onCancel={onCancel} />);
}

describe('CancelGuests', () => {
  beforeEach(() => {
    onCancel.mockClear();
  });

  it('cancels reservation', async () => {
    renderComponent();
    click('Select All');
    click('Cancel Reservation');
    expect(ll.cancelBooking).toHaveBeenLastCalledWith(guests);
    await loading();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('cancels selected guests', async () => {
    renderComponent();
    click(mickey.name);
    click(pluto.name);
    click('Cancel Guests');
    expect(ll.cancelBooking).toHaveBeenLastCalledWith([guests[0], guests[2]]);
    await loading();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows error on failure', async () => {
    renderComponent();
    ll.cancelBooking.mockRejectedValueOnce(
      new RequestError({ ok: false, status: 0, data: {} })
    );
    click('Select All');
    click('Cancel Reservation');
    await loading();
    see('Network request failed');
  });
});
