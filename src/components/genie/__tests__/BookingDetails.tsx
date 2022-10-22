import { Booking } from '@/api/genie';
import { ClientProvider } from '@/contexts/Client';
import { ParkProvider } from '@/contexts/Park';
import { displayTime } from '@/datetime';
import { click, render, screen, setTime, waitFor } from '@/testing';
import {
  client,
  booking,
  multiExp,
  allDayExp,
  mickey,
  minnie,
  pluto,
  hs,
  sdd,
  jc,
  hm,
  sm,
  mk,
} from '@/__fixtures__/genie';
import BookingDetails from '../BookingDetails';

setTime('09:00');
const onClose = jest.fn();
const renderComponent = (b: Booking = booking) =>
  render(
    <ClientProvider value={client}>
      <ParkProvider value={hs}>
        <BookingDetails booking={b} onClose={onClose} />
      </ParkProvider>
    </ClientProvider>
  );

describe('BookingDetails', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders booking details', () => {
    const { container } = renderComponent();
    expect(container).toHaveTextContent('11:25 AM - 12:25 PM');
    screen.getByText(mickey.name);
    screen.getByText(minnie.name);
    screen.getByText(pluto.name);
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
      `${displayTime(multiExp.start.time || '')} - Park Close`
    );
    expect(
      screen
        .getAllByRole('heading', { level: 3 })
        .map(h => h.textContent)
        .slice(0, 2)
    ).toEqual([hs.name, mk.name]);
    expect(
      screen
        .getAllByRole('listitem')
        .map(li => li.textContent)
        .slice(0, 4)
    ).toEqual([sdd.name, hm.name, jc.name, sm.name]);
    expect(screen.queryByText('Redemptions left: 1')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument();
  });

  it('shows all-day experience redemption details', async () => {
    renderComponent(allDayExp);
    screen.getByText(allDayExp.name);
    screen.getByText('Park Open - Park Close');
    screen.getByText('Redemptions left: 2');
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument();
  });
});
