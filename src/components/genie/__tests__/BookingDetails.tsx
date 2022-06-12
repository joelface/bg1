import { Booking } from '/api/genie';
import { ClientProvider } from '/contexts/Client';
import { displayTime } from '/datetime';
import { click, render, screen, waitFor } from '/testing';
import {
  client,
  booking,
  multiExp,
  allDayExp,
  mickey,
  minnie,
  pluto,
} from '/__fixtures__/genie';
import BookingDetails from '../BookingDetails';

const onClose = jest.fn();
const renderComponent = (b: Booking = booking) =>
  render(
    <ClientProvider value={client}>
      <BookingDetails booking={b} onClose={onClose} />
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

  it('shows all-day experience redemption details', async () => {
    renderComponent(allDayExp);
    screen.getByText(allDayExp.experience.name);
    screen.getByText('Park Open - Park Close');
    screen.getByText('Redemptions left: 1');
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument();
  });
});
