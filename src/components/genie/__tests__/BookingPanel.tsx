import { ClientProvider } from '/contexts/Client';
import { displayTime } from '/datetime';
import { click, loading, render, screen, within } from '/testing';
import { client, bookings } from '/__fixtures__/genie';
import BookingPanel from '../BookingPanel';

const onClose = jest.fn();
const renderComponent = () =>
  render(
    <ClientProvider value={client}>
      <BookingPanel onClose={onClose} />
    </ClientProvider>
  );

describe('BookingPanel', () => {
  jest.useFakeTimers();

  it('renders booking panel', async () => {
    renderComponent();
    const lis = await screen.findAllByRole('listitem');
    lis.forEach((li, i) => {
      const { experience, start, end } = bookings[i];
      within(li).getByText(experience.name);
      within(li).getByText(start.time ? displayTime(start.time) : 'open');
      within(li).getByText(end.time ? displayTime(end.time) : 'close');
    });

    click('More');
    click('Back');

    click(screen.getAllByText('More')[1]);
    click('Cancel');
    click('Select All');
    click('Cancel Reservation');
    screen.getByText(bookings[1].experience.name);
    await loading();
    expect(
      screen.queryByText(bookings[1].experience.name)
    ).not.toBeInTheDocument();

    click('Close');
    click(screen.getByTestId('panel-shade'));
    jest.runOnlyPendingTimers();
    expect(onClose).toBeCalledTimes(2);
  });

  it('renders empty booking panel', async () => {
    client.bookings.mockResolvedValueOnce([]);
    renderComponent();
    await screen.findByText('No current reservations');
  });
});
