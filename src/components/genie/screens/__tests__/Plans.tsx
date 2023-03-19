import { bookings } from '@/__fixtures__/genie';
import { Booking } from '@/api/genie';
import { useNav } from '@/contexts/Nav';
import { PlansProvider } from '@/contexts/Plans';
import { displayTime } from '@/datetime';
import { click, render, screen, see, setTime, within } from '@/testing';

import BookingDetails from '../BookingDetails';
import Plans from '../Plans';

jest.mock('@/contexts/Nav');
setTime('09:00');
const refreshPlans = jest.fn();

function renderComponent(plans: Booking[]) {
  render(
    <PlansProvider value={{ plans, refreshPlans, loaderElem: null }}>
      <Plans />
    </PlansProvider>
  );
}

describe('Plans', () => {
  const { goTo } = useNav();

  it('shows reservations', async () => {
    renderComponent(bookings);
    const lis = await screen.findAllByRole('listitem');
    see('Today, October 1');
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
    expect(goTo).lastCalledWith(<BookingDetails booking={bookings[1]} />);
  });

  it('shows "No existing plans" message', async () => {
    renderComponent([]);
    see('No existing plans');
  });
});
