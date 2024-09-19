import {
  allDayExp,
  bg,
  booking,
  hm,
  hs,
  jc,
  ll,
  lttRes,
  mickey,
  minnie,
  mk,
  modOffer,
  multiExp,
  pluto,
  renderResort,
  sdd,
  sm,
} from '@/__fixtures__/ll';
import { RequestError } from '@/api/client';
import { Booking, DasBooking } from '@/api/itinerary';
import { useNav } from '@/contexts/Nav';
import { ParkContext } from '@/contexts/Park';
import { RebookingContext } from '@/contexts/Rebooking';
import { DEFAULT_THEME } from '@/contexts/Theme';
import { displayTime } from '@/datetime';
import {
  TODAY,
  act,
  click,
  loading,
  screen,
  see,
  setTime,
  waitFor,
} from '@/testing';

import BookNewReturnTime from '../BookNewReturnTime';
import BookingDetails from '../BookingDetails';
import CancelGuests from '../CancelGuests';
import Home from '../Home';
import SelectReturnTime from '../SelectReturnTime';

jest.mock('@/contexts/Nav');
setTime('09:00');
const rebooking = { begin: jest.fn(), end: jest.fn(), current: undefined };
const setPark = jest.fn();

function renderComponent(booking: Booking, isNew = false) {
  return renderResort(
    <ParkContext.Provider value={{ park: mk, setPark }}>
      <RebookingContext.Provider value={rebooking}>
        <BookingDetails booking={booking} isNew={isNew} />
      </RebookingContext.Provider>
    </ParkContext.Provider>
  );
}

describe('BookingDetails', () => {
  const { goTo, goBack } = jest.mocked(useNav());

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows LL booking details', async () => {
    renderComponent(booking);
    expect(see('Your Lightning Lane').tagName).toBe('H1');
    see.time(booking.start.time as string);
    see.time(booking.end.time as string);
    see(mickey.name);
    see(minnie.name);
    see(pluto.name);
    click('Modify');
    expect(rebooking.begin).toHaveBeenLastCalledWith(booking);
    expect(goBack).toHaveBeenCalledTimes(1);

    click('Cancel');
    expect(goTo).toHaveBeenLastCalledWith(
      <CancelGuests booking={booking} onCancel={expect.any(Function)} />
    );

    const onCancel = goTo.mock.lastCall?.[0]?.props?.onCancel;
    act(() => onCancel([mickey, minnie]));
    see(mickey.name);
    see(minnie.name);
    await waitFor(() => see.no(pluto.name));

    act(() => onCancel([]));
    expect(goBack).toHaveBeenCalledTimes(2);

    ll.offer.mockRejectedValueOnce(
      new RequestError({ ok: false, status: 410, data: {} })
    );
    click('Change');
    await loading();
    see('No other times available');

    ll.offer.mockResolvedValueOnce(modOffer);
    click('Change');
    await loading();
    expect(ll.offer).toHaveBeenCalledTimes(2);
    expect(goTo).toHaveBeenLastCalledWith(
      <SelectReturnTime offer={modOffer} onOfferChange={expect.any(Function)} />
    );
    const onOfferChange = goTo.mock.lastCall?.[0]?.props?.onOfferChange;
    const newOffer = {
      ...modOffer,
      start: { date: TODAY, time: '14:00:00' },
      end: { date: TODAY, time: '15:00:00' },
    };
    onOfferChange(newOffer);
    expect(goTo).toHaveBeenLastCalledWith(
      <BookNewReturnTime offer={newOffer} />
    );

    see.no('Show Plans', 'button');
  });

  it('has Show Plans button if new booking', () => {
    renderComponent(booking, true);
    click('Show Plans');
    expect(goBack).toHaveBeenLastCalledWith({
      screen: Home,
      props: { tabName: 'Plans' },
    });
  });

  it('shows Multiple Experiences LL details', async () => {
    const { container } = renderComponent(multiExp);
    expect(see('Your Lightning Lane').parentNode?.parentNode).toHaveClass(
      DEFAULT_THEME.bg
    );
    see('Multiple Experiences');
    see(`${displayTime(multiExp.start.time || '')}`);
    see('Park Close');
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
    expect(container).toHaveTextContent(
      `${sdd.name} was temporarily unavailable during your return time.`
    );
    see.no('Redemptions left: 1');
    see.no('Modify');
    see.no('Cancel');
  });

  it('omits "temporarily unavailable" message if unknown original experience', async () => {
    const { container } = renderComponent({ ...multiExp, id: '', name: '' });
    see('Multiple Experiences');
    expect(container).not.toHaveTextContent('was temporarily unavailable');
  });

  it('uses park theme for single-park Multiple Experiences LL', async () => {
    renderComponent({
      ...multiExp,
      choices: multiExp.choices?.filter(exp => exp.park === booking.park),
    });
    see('Multiple Experiences');
    expect(see('Your Lightning Lane').parentNode?.parentNode).toHaveClass(
      mk.theme.bg
    );
  });

  it('shows all-day experience redemption details', async () => {
    renderComponent(allDayExp);
    see(allDayExp.name);
    see('Park Open');
    see('Park Close');
    see('Redemptions left: 2');
    see.no('Cancel');
  });

  it('shows boarding group details', async () => {
    renderComponent(bg);
    see(bg.name);
    expect(see('Boarding Group:')).toHaveTextContent(
      `Boarding Group: ${bg.boardingGroup}`
    );
    see.no('Your boarding group has been called');
    see.no('Cancel');
  });

  it('shows when boarding group is called', async () => {
    renderComponent({ ...bg, status: 'SUMMONED' });
    see('Your boarding group has been called');
  });

  it('specifies DAS in heading', () => {
    renderComponent({
      ...booking,
      type: 'DAS',
      subtype: 'IN_PARK',
      modifiable: undefined,
    } as DasBooking);
    expect(see('Your DAS Selection').tagName).toBe('H1');
  });

  it('shows dining reservation', () => {
    renderComponent(lttRes);
    see(lttRes.name);
    see.no('Cancel');
    see.no('Modify');
  });
});
