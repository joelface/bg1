import { bookings, mk, renderResort } from '@/__fixtures__/genie';
import { BookingDateProvider } from '@/contexts/BookingDate';
import { ParkContext } from '@/contexts/Park';
import { PlansContext } from '@/contexts/Plans';
import { TOMORROW, click, screen, see, setTime } from '@/testing';

import BookingDateSelect from '../Home/BookingDateSelect';

const setPark = jest.fn();

function BookingDateSelectTest() {
  return (
    <PlansContext.Provider
      value={{ plans: bookings, refreshPlans: () => {}, loaderElem: null }}
    >
      <ParkContext.Provider value={{ park: mk, setPark }}>
        <BookingDateProvider>
          <BookingDateSelect />
        </BookingDateProvider>
      </ParkContext.Provider>
    </PlansContext.Provider>
  );
}

function renderComponent() {
  renderResort(<BookingDateSelectTest />);
}

describe('BookingDateSelect', () => {
  it('renders date selector', () => {
    setTime('10:00');
    renderComponent();
    click('Today');
    see('October');
    click('2');

    click('10/2');
    expect(
      screen.getByRole('form', { name: 'Booking Date Selection' })
    ).toHaveFormValues({
      bookingDate: TOMORROW,
    });
    click('1');
    see('Today');
  });

  it('spans months when necessary', () => {
    setTime('10:00', 14 * 24 * 60);
    renderComponent();
    click('Today');
    see('October – November');
    see('15');
    click('5');
    see('11/5');
  });
});
