import { Park } from '@/api/genie';
import { ClientProvider } from '@/contexts/Client';
import { TODAY } from '@/testing';
import {
  act,
  click,
  elemScrollMock,
  loading,
  render,
  screen,
  withCoords,
  setTime,
  waitFor,
  within,
} from '@/testing';
import {
  client,
  mk,
  hs,
  hm,
  jc,
  sm,
  mickey,
  minnie,
  bookings,
  sdd,
} from '@/__fixtures__/genie';
import TipBoard from '../TipBoard';

jest.mock('@/ping');

let hidden = false;
Object.defineProperty(document, 'hidden', { get: () => hidden });

const toggleVisibility = () => {
  hidden = !hidden;
  document.dispatchEvent(new Event('visibilitychange'));
};

const getExperiences = () =>
  screen
    .getAllByRole('listitem')
    .map(li => within(li).getByRole('heading').textContent);

const sortBy = (sortType: string) => {
  click('Sort By');
  click(sortType);
  return getExperiences();
};

const changePark = async (park: Park) => {
  click('Park');
  click(park.name);
  await loading();
};

jest.useFakeTimers();

const names = (exps: { name: string }[]) => exps.map(({ name }) => name);

const renderComponent = async () => {
  const view = render(
    <ClientProvider value={client}>
      <TipBoard />
    </ClientProvider>
  );
  await loading();
  return view;
};

describe('TipBoard', () => {
  beforeEach(() => {
    setTime('09:00');
    elemScrollMock.mockClear();
    localStorage.clear();
  });

  it('renders TipBoard`', async () => {
    await renderComponent();

    expect(client.experiences).lastCalledWith(
      expect.objectContaining({ id: mk.id })
    );
    within(
      (await screen.findByText(jc.name)).closest('li') as HTMLElement
    ).getByText('Lightning Lane Booked');
    expect(elemScrollMock).toBeCalledTimes(1);

    click('Your Day');
    await screen.findByText('Your Day');

    click('Close');
    await waitFor(() =>
      expect(screen.queryByText('Your Day')).not.toBeInTheDocument()
    );

    expect(getExperiences()).toEqual(names([jc, sm, hm]));
    expect(sortBy('Soonest')).toEqual(names([sm, hm, jc]));
    expect(sortBy('Standby')).toEqual(names([sm, jc, hm]));
    expect(sortBy('A to Z')).toEqual(names([hm, jc, sm]));
    sortBy('Nearby');
    await loading();
    expect(getExperiences()).toEqual(names([sm, hm, jc]));
    expect(elemScrollMock).toBeCalledTimes(5);

    client.experiences.mockResolvedValueOnce({ plus: [sdd] });
    elemScrollMock.mockClear();
    await changePark(hs);
    screen.getByText(sdd.name);
    expect(client.experiences).lastCalledWith(
      expect.objectContaining({ id: hs.id })
    );
    expect(elemScrollMock).toBeCalledTimes(1);
    await changePark(mk);
    screen.getByText(hm.name);

    click('2:30 PM');
    await loading();
    screen.getByText('Your Party');
    click('Cancel');

    client.experiences.mockClear();

    act(() => {
      jest.advanceTimersByTime(60_000);
      toggleVisibility();
      toggleVisibility();
    });
    await loading();
    click('Refresh Tip Board');
    await loading();

    expect(screen.getByText('Book:')).toHaveTextContent('Book: 11:00 AM');
    expect(screen.getByText('Drop:')).toHaveTextContent('Drop: 11:30 AM');

    const dropBtn = screen.getByTitle('Upcoming Drop (more info)');
    within(dropBtn.closest('li') as HTMLElement).getByText(sm.name);
    click(dropBtn);
    const dropHeading = screen.getByText('Upcoming Drop');
    click('Close');
    expect(dropHeading).not.toBeInTheDocument();
  });

  it('sorts list properly', async () => {
    client.experiences.mockResolvedValueOnce({ plus: [jc, hm] });
    const {
      priority,
      flex: { nextAvailableTime },
      standby: { waitTime },
    } = jc;

    jc.priority = undefined;
    await renderComponent();
    expect(getExperiences()).toEqual(names([hm, jc]));
    jc.priority = priority;

    jc.flex.nextAvailableTime = hm.flex.nextAvailableTime;
    expect(sortBy('Soonest')).toEqual(names([jc, hm]));
    jc.flex.nextAvailableTime = nextAvailableTime;

    jc.standby.waitTime = hm.standby.waitTime;
    expect(sortBy('Standby')).toEqual(names([hm, jc]));
    jc.standby.waitTime = waitTime;

    jc.flex.available = false;
    expect(getExperiences()).toEqual(names([hm, jc]));
    jc.flex.available = true;
  });

  it('shows Rebooking pane when rebooking', async () => {
    await renderComponent();
    expect(elemScrollMock).toBeCalledTimes(1);
    click('Your Day');
    click((await screen.findAllByText('More'))[3]);
    screen.getByText('Your Lightning Lane');
    screen.getByRole('heading', { name: bookings[3].name });
    click('Rebook');

    expect(elemScrollMock).toBeCalledTimes(2);
    screen.getByText('Rebooking');
    click('Keep');
    expect(screen.queryByText('Rebooking')).not.toBeInTheDocument();
    expect(elemScrollMock).toBeCalledTimes(3);
  });

  it('allows most recent reservation to be rebooked', async () => {
    client.guests.mockResolvedValueOnce({
      eligible: [],
      ineligible: [
        { ...mickey, ineligibleReason: 'TOO_EARLY' },
        { ...minnie, ineligibleReason: 'TOO_EARLY' },
      ],
    });
    client.offer.mockResolvedValueOnce({
      id: 'sm1',
      start: { date: TODAY, time: '12:45:00' },
      end: { date: TODAY, time: '13:45:00' },
      active: true,
      changed: false,
      guests: {
        eligible: [mickey, minnie],
        ineligible: [],
      },
    });
    const newBooking = {
      ...sm,
      type: 'LL' as const,
      start: { date: TODAY, time: '12:45:00' },
      end: { date: TODAY, time: '13:45:00' },
      cancellable: true,
      guests: [
        { ...mickey, entitlementId: 'sm1125_01' },
        { ...minnie, entitlementId: 'sm1125_02' },
      ],
      bookingId: 'sm1125_01',
    };
    client.book.mockResolvedValueOnce({ ...newBooking });

    render(
      <ClientProvider value={client}>
        <TipBoard />
      </ClientProvider>
    );
    await loading();
    expect(screen.queryByText('Rebooking')).not.toBeInTheDocument();
    click('Your Day');
    screen.getByText('Your Day');
    click((await screen.findAllByText('More'))[0]);
    screen.getByRole('heading', { name: bookings[0].name });
    expect(screen.queryByText('Rebook')).not.toBeInTheDocument();

    click('Back');
    click(screen.getAllByText('More')[3]);
    screen.getByRole('heading', { name: bookings[3].name });

    click('Rebook');
    screen.getByText('Rebooking');

    click('12:45 PM');
    await loading();
    click('Edit');
    click(mickey.name);
    click('Confirm Party');
    click('Rebook Lightning Lane');

    await loading();

    expect(client.cancelBooking).toBeCalledTimes(2);
    expect(client.cancelBooking).nthCalledWith(1, [bookings[3].guests[1]]);
    expect(client.cancelBooking).nthCalledWith(2, [newBooking.guests[0]]);
    screen.getByText('Your Lightning Lane');
    screen.getByRole('heading', { name: sm.name });
    expect(screen.queryByText('Rebooking')).not.toBeInTheDocument();
  });

  it('saves selected park until tomorrow', async () => {
    const parkIcon = () =>
      (screen.getByTitle('Park') as HTMLButtonElement).textContent;

    setTime('12:00');
    let { unmount } = await renderComponent();
    screen.getByText(hm.name);
    expect(parkIcon()).toBe(mk.icon);

    await changePark(hs);
    unmount();
    setTime('23:59:59');
    ({ unmount } = await renderComponent());
    screen.getByText(hm.name);
    expect(parkIcon()).toBe(hs.icon);

    unmount();
    setTime('00:00', 1);
    ({ unmount } = await renderComponent());
    screen.getByText(hm.name);
    expect(parkIcon()).toBe(mk.icon);
  });

  it('pins attraction to top if favorited', async () => {
    client.experiences.mockResolvedValueOnce({
      plus: [jc, sm, { ...hm, flex: { available: false } }],
    });
    await renderComponent();
    expect(getExperiences()).toEqual(names([jc, sm, hm]));
    click(screen.getAllByTitle('Favorite')[2]);
    expect(getExperiences()).toEqual(names([hm, jc, sm]));
  });

  it('shows lightning picks at top, but below starred rides', async () => {
    setTime('12:05');
    await renderComponent();
    const lp = screen.getAllByRole('listitem')[0];
    expect(lp).toHaveTextContent(sm.name);
    within(lp).getByTitle('Lightning Pick (more info)');
    expect(within(lp).queryByTitle('Drop')).not.toBeInTheDocument();

    click(screen.getAllByTitle('Favorite')[2]);
    expect(getExperiences()).toEqual(names([hm, sm, jc]));

    click('Lightning Pick (more info)');
    const lpHeading = screen.getByText('Lightning Pick');
    click('Close');
    expect(lpHeading).not.toBeInTheDocument();
  });

  it('only sorts by location if user is in the park', async () => {
    await renderComponent();
    expect(getExperiences()).toEqual(names([jc, sm, hm]));

    sortBy('Nearby');
    await loading();
    expect(getExperiences()).toEqual(names([sm, hm, jc]));

    await withCoords([0, 0], async () => {
      click('Refresh Tip Board');
      await loading();
      expect(getExperiences()).toEqual(names([jc, sm, hm]));
    });
  });
});
