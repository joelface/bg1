import { Park } from '/api/genie';
import { ClientProvider } from '/contexts/Client';
import {
  act,
  click,
  elemScrollMock,
  fireEvent,
  render,
  screen,
  setTime,
  waitFor,
  within,
} from '/testing';
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
} from '/__fixtures__/genie';
import TipBoard from '../TipBoard';

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
  fireEvent.change(screen.getByTitle('Sort By'), {
    target: { value: sortType },
  });
  return getExperiences();
};

const changePark = (park: Park) =>
  fireEvent.change(screen.getByTitle('Park'), {
    target: { value: park.id },
  });

jest.useFakeTimers({ now: new Date('2022-07-17 9:00:00') });

const waitForRefresh = async () => {
  await screen.findByLabelText('Loading…');
  act(() => {
    jest.advanceTimersByTime(500);
  });
  await waitFor(() =>
    expect(screen.queryByLabelText('Loading…')).not.toBeInTheDocument()
  );
};

const names = (exps: { name: string }[]) => exps.map(({ name }) => name);

const renderComponent = () =>
  render(
    <ClientProvider value={client}>
      <TipBoard />
    </ClientProvider>
  );

describe('TipBoard', () => {
  beforeEach(() => {
    elemScrollMock.mockClear();
  });

  it('renders TipBoard`', async () => {
    renderComponent();

    expect(client.plusExperiences).lastCalledWith(
      expect.objectContaining({ id: mk.id })
    );
    within(
      (await screen.findByText(jc.name)).closest('li') as HTMLElement
    ).getByText('Lightning Lane Booked');
    expect(elemScrollMock).toBeCalledTimes(1);

    click('Your Lightning Lanes');
    await screen.findByText('Your Lightning Lanes');

    click('Close');
    await waitFor(() =>
      expect(screen.queryByText('Your Lightning Lanes')).not.toBeInTheDocument()
    );

    expect(getExperiences()).toEqual(names([jc, sm, hm]));
    expect(sortBy('soonest')).toEqual(names([sm, hm, jc]));
    await waitFor(() => expect(sortBy('standby')).toEqual(names([sm, jc, hm])));
    await waitFor(() => expect(sortBy('aToZ')).toEqual(names([hm, jc, sm])));
    expect(elemScrollMock).toBeCalledTimes(4);

    const sdd = {
      id: 'sdd',
      name: 'Slinky Dog Dash',
      type: 'ATTRACTION',
      standby: { available: true, waitTime: 75 },
      flex: { available: false },
    } as const;
    client.plusExperiences.mockResolvedValueOnce([sdd]);
    elemScrollMock.mockClear();
    changePark(hs);
    await waitForRefresh();
    await screen.findByText(sdd.name);
    expect(client.plusExperiences).lastCalledWith(
      expect.objectContaining({ id: hs.id })
    );
    expect(elemScrollMock).toBeCalledTimes(1);
    changePark(mk);
    await waitForRefresh();
    await screen.findByText(hm.name);

    await waitFor(() => click('2:30 PM'));
    await waitForRefresh();
    await screen.findByText('Your Party');
    await waitFor(() => click('Cancel'));

    client.plusExperiences.mockClear();

    act(() => {
      jest.advanceTimersByTime(60_000);
      toggleVisibility();
      toggleVisibility();
    });
    await waitForRefresh();
    return;
    click('Refresh Tip Board');
    await waitForRefresh();
  });

  it('sorts list properly', async () => {
    client.plusExperiences.mockResolvedValueOnce([jc, hm]);
    renderComponent();
    const {
      priority,
      flex: { nextAvailableTime },
      standby: { waitTime },
    } = jc;

    jc.priority = undefined;
    await waitFor(async () =>
      expect(getExperiences()).toEqual([hm.name, jc.name])
    );
    jc.priority = priority;

    jc.flex.nextAvailableTime = hm.flex.nextAvailableTime;
    await waitFor(async () =>
      expect(sortBy('soonest')).toEqual([jc.name, hm.name])
    );
    jc.flex.nextAvailableTime = nextAvailableTime;

    jc.standby.waitTime = hm.standby.waitTime;
    await waitFor(async () =>
      expect(sortBy('standby')).toEqual([hm.name, jc.name])
    );
    jc.standby.waitTime = waitTime;

    jc.flex.available = false;
    expect(getExperiences()).toEqual([hm.name, jc.name]);
    jc.flex.available = true;
  });

  it('shows Rebooking pane when rebooking', async () => {
    renderComponent();
    expect(elemScrollMock).toBeCalledTimes(1);
    click('Your Lightning Lanes');
    click((await screen.findAllByText('More'))[2]);
    screen.getByText('Your Lightning Lane');
    screen.getByRole('heading', { name: bookings[2].experience.name });
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
      start: { date: '2022-07-17', time: '12:45:00' },
      end: { date: '2022-07-17', time: '13:45:00' },
      changeStatus: 'NONE',
    });
    const newBooking = {
      experience: sm,
      park: mk,
      start: { date: '2022-07-17', time: '12:45:00' },
      end: { date: '2022-07-17', time: '13:45:00' },
      cancellable: true,
      guests: [
        { ...mickey, entitlementId: 'sm1125_01' },
        { ...minnie, entitlementId: 'sm1125_02' },
      ],
    };
    client.book.mockResolvedValueOnce({ ...newBooking });

    render(
      <ClientProvider value={client}>
        <TipBoard />
      </ClientProvider>
    );
    expect(screen.queryByText('Rebooking')).not.toBeInTheDocument();
    click('Your Lightning Lanes');
    await screen.findByText('Your Lightning Lanes');
    await waitFor(() => click('More'));
    screen.getByRole('heading', { name: bookings[0].experience.name });
    expect(
      screen.queryByRole('button', { name: 'Rebook' })
    ).not.toBeInTheDocument();

    click('Back');
    click(screen.getAllByText('More')[2]);
    screen.getByRole('heading', { name: bookings[2].experience.name });

    click('Rebook');
    screen.getByText('Rebooking');

    click('12:45 PM');
    await waitFor(() => click('Edit'));
    click(mickey.name);
    click('Confirm Party');
    click('Rebook Lightning Lane');

    await waitForRefresh();

    await waitFor(() => expect(client.cancelBooking).toBeCalledTimes(2));
    expect(client.cancelBooking).nthCalledWith(1, [bookings[2].guests[1]]);
    expect(client.cancelBooking).nthCalledWith(2, [newBooking.guests[0]]);
    screen.getByText('Your Lightning Lane');
    screen.getByRole('heading', { name: sm.name });
    expect(screen.queryByText('Rebooking')).not.toBeInTheDocument();
  });

  it('shows time banners', async () => {
    renderComponent();
    client.plusExperiences.mockResolvedValueOnce([
      { ...hm, flex: { available: false, enrollmentStartTime: '07:00:00' } },
    ]);
    click('Refresh Tip Board');
    expect(await screen.findByText('Booking start:')).toHaveTextContent(
      '7:00 AM'
    );
    click('Refresh Tip Board');
    expect(await screen.findByText('Next drop:')).toHaveTextContent('1:30 PM');
  });

  it('saves selected park until tomorrow', async () => {
    const parkId = () => (screen.getByTitle('Park') as HTMLSelectElement).value;

    setTime('12:00');
    let { unmount } = renderComponent();
    await screen.findByText(hm.name);
    expect(parkId()).toBe(mk.id);

    changePark(hs);
    unmount();
    setTime('23:59:59');
    ({ unmount } = renderComponent());
    await screen.findByText(hm.name);
    expect(parkId()).toBe(hs.id);

    unmount();
    setTime('00:00', 1);
    ({ unmount } = renderComponent());
    await screen.findByText(hm.name);
    expect(parkId()).toBe(mk.id);
  });

  it('pins attraction to top if favorited', async () => {
    renderComponent();
    await waitFor(() =>
      expect(getExperiences()).toEqual([jc.name, sm.name, hm.name])
    );
    click(screen.getAllByRole('button', { name: 'Favorite' })[2]);
    expect(getExperiences()).toEqual([hm.name, jc.name, sm.name]);
  });
});
