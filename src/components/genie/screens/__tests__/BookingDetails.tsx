import {
  allDayExp,
  bg,
  booking,
  hm,
  hs,
  jc,
  lttRes,
  mickey,
  minnie,
  mk,
  multiExp,
  pluto,
  sdd,
  sm,
  wdw,
} from '@/__fixtures__/genie';
import { Booking, DasBooking } from '@/api/genie';
import { useNav } from '@/contexts/Nav';
import { ParkProvider } from '@/contexts/Park';
import { RebookingProvider } from '@/contexts/Rebooking';
import { ResortDataProvider } from '@/contexts/ResortData';
import { DEFAULT_THEME } from '@/contexts/Theme';
import { displayTime } from '@/datetime';
import { act, click, render, screen, see, setTime, waitFor } from '@/testing';

import BookingDetails from '../BookingDetails';
import CancelGuests from '../CancelGuests';

jest.mock('@/contexts/GenieClient');
jest.mock('@/contexts/Nav');
setTime('09:00');
const rebooking = { begin: jest.fn(), end: jest.fn(), current: undefined };
const setPark = jest.fn();

function renderComponent(b: Booking = booking) {
  render(
    <ResortDataProvider value={wdw}>
      <ParkProvider value={{ park: mk, setPark }}>
        <RebookingProvider value={rebooking}>
          <BookingDetails booking={b} />
        </RebookingProvider>
      </ParkProvider>
    </ResortDataProvider>
  );
}

describe('BookingDetails', () => {
  const { goTo, goBack } = useNav();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows LL booking details', async () => {
    renderComponent();
    expect(see('Your Lightning Lane').tagName).toBe('H1');
    see(displayTime(booking.start.time as string));
    see(displayTime(booking.end.time as string));
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

    const onCancel = jest.mocked(goTo).mock.lastCall?.[0]?.props?.onCancel;
    act(() => onCancel([mickey, minnie]));
    see(mickey.name);
    see(minnie.name);
    await waitFor(() => see.no(pluto.name));

    act(() => onCancel([]));
    expect(goBack).toHaveBeenCalledTimes(2);
  });

  it('shows Multiple Experiences LL details', async () => {
    renderComponent(multiExp);
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
    see.no('Redemptions left: 1');
    see.no('Modify');
    see.no('Cancel');
  });

  it('uses park theme for single-park Multiple Experiences LL', async () => {
    renderComponent({
      ...multiExp,
      choices: multiExp.choices?.filter(exp => exp.park === mk),
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
