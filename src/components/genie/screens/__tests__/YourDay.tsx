import { bookings, client } from '@/__fixtures__/genie';
import { ClientProvider } from '@/contexts/Client';
import { useNav } from '@/contexts/Nav';
import { displayTime } from '@/datetime';
import { act, click, loading, render, screen, see, within } from '@/testing';

import YourDay from '../YourDay';

jest.mock('@/contexts/Nav');
jest.useFakeTimers({ now: new Date('2021-10-01T09:00:00-0400') });

async function renderComponent() {
  render(
    <ClientProvider value={client}>
      <YourDay />
    </ClientProvider>
  );
  await loading();
}

describe('YourDay', () => {
  const { goTo } = useNav();

  it('shows reservations', async () => {
    await renderComponent();
    const lis = await screen.findAllByRole('listitem');
    bookings.forEach((booking, i) => {
      const inLI = within(lis[i]);
      inLI.getByText(booking.choices ? 'Multiple Experiences' : booking.name);
      inLI.getByText(
        booking.start.time ? displayTime(booking.start.time) : 'Park Open'
      );
      if (booking.type === 'LL') {
        inLI.getByText(
          booking.end?.time ? displayTime(booking.end.time) : 'Park Close'
        );
      }
    });

    click(see.all('Info')[1]);
    expect(goTo).toBeCalled();
    const { booking, onClose } = jest.mocked(goTo).mock.calls[0][0].props;
    expect(booking).toBe(bookings[1]);
    act(() => onClose([]));
    see.no(bookings[1].name);
  });

  it('shows "No current reservations" message', async () => {
    client.bookings.mockResolvedValueOnce([]);
    await renderComponent();
    see('No current reservations');
  });
});
