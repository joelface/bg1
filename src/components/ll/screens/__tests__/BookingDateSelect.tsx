import { useState } from 'react';

import { ak, bookings, mk, renderResort } from '@/__fixtures__/ll';
import { BookingDateProvider } from '@/contexts/BookingDate';
import { ParkContext } from '@/contexts/Park';
import { PlansContext } from '@/contexts/Plans';
import { TOMORROW, click, screen, see, setTime } from '@/testing';

import BookingDateSelect from '../Home/BookingDateSelect';

function BookingDateSelectTest() {
  const [park, setPark] = useState(mk);

  return (
    <PlansContext.Provider
      value={{ plans: bookings, refreshPlans: () => {}, loaderElem: null }}
    >
      <ParkContext.Provider value={{ park, setPark }}>
        <BookingDateProvider>
          {park.name}
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
    see(ak.name);

    click('10/2');
    expect(
      screen.getByRole('form', { name: 'Booking Date Selection' })
    ).toHaveFormValues({
      bookingDate: TOMORROW,
    });
    click('1');
    see('Today');
    see(mk.name);
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
