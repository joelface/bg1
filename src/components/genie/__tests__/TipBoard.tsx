import { h } from 'preact';
import FakeTimers from '@sinonjs/fake-timers';

import { Park } from '@/api/genie';
import { GenieClientProvider } from '@/contexts/GenieClient';
import {
  click,
  elemScrollMock,
  fireEvent,
  render,
  screen,
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
} from '@/__fixtures__/genie';
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

const clock = FakeTimers.install({ shouldAdvanceTime: true });

const waitForRefresh = async () => {
  await screen.findAllByLabelText('Loading…');
  clock.runToLast();
  await waitFor(() =>
    expect(screen.queryByLabelText('Loading…')).not.toBeInTheDocument()
  );
};

const renderComponent = () =>
  render(
    <GenieClientProvider value={client}>
      <TipBoard />
    </GenieClientProvider>
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

    click('Close');
    clock.runToLast();
    await waitFor(() =>
      expect(screen.queryByText('Your Lightning Lanes')).not.toBeInTheDocument()
    );

    expect(getExperiences()).toEqual([jc.name, sm.name, hm.name]);
    await waitFor(() =>
      expect(sortBy('soonest')).toEqual([sm.name, hm.name, jc.name])
    );
    await waitFor(() =>
      expect(sortBy('standby')).toEqual([sm.name, jc.name, hm.name])
    );
    await waitFor(() =>
      expect(sortBy('aToZ')).toEqual([hm.name, jc.name, sm.name])
    );
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
    expect(client.plusExperiences).lastCalledWith(
      expect.objectContaining({ id: hs.id })
    );
    await screen.findByText(sdd.name);
    expect(elemScrollMock).toBeCalledTimes(1);
    changePark(mk);
    await screen.findByText(hm.name);

    await waitForRefresh();
    click('2:30 PM');
    await waitForRefresh();
    await waitFor(() => click('Cancel'));

    client.plusExperiences.mockClear();
    toggleVisibility();
    toggleVisibility();
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
      expect(sortBy('soonest')).toEqual([hm.name, jc.name])
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
    click((await screen.findAllByText('More'))[1]);
    screen.getByText('Your Lightning Lane');
    screen.getByText('Barnstormer');
    click('Rebook');

    expect(elemScrollMock).toBeCalledTimes(2);
    screen.getByText('Rebooking');
    click('Keep');
    expect(screen.queryByText('Rebooking')).not.toBeInTheDocument();
    expect(elemScrollMock).toBeCalledTimes(3);
  });

  it('allows most recent reservation to be rebooked', async () => {
    client.guests.mockResolvedValueOnce({
      guests: [],
      ineligibleGuests: [
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
      guests: [
        { ...mickey, entitlementId: 'sm1125_01' },
        { ...minnie, entitlementId: 'sm1125_02' },
      ],
    };
    client.book.mockResolvedValueOnce({ ...newBooking });

    render(
      <GenieClientProvider value={client}>
        <TipBoard />
      </GenieClientProvider>
    );
    expect(screen.queryByText('Rebooking')).not.toBeInTheDocument();
    click('Your Lightning Lanes');
    await screen.findByText('Your Lightning Lanes');
    click('More');
    screen.getByRole('heading', { name: bookings[0].experience.name });
    expect(
      screen.queryByRole('button', { name: 'Rebook' })
    ).not.toBeInTheDocument();

    click('Back');
    click(screen.getAllByText('More')[1]);
    screen.getByRole('heading', { name: bookings[1].experience.name });

    click('Rebook');
    screen.getByText('Rebooking');

    click('12:45 PM');
    await clock.runToLastAsync();
    click('Edit');
    click('Mickey Mouse');
    click('Confirm Party');
    click('Rebook Lightning Lane');
    await clock.runToLastAsync();

    expect(client.cancelBooking).nthCalledWith(1, [bookings[1].guests[1]]);
    expect(client.cancelBooking).nthCalledWith(2, [newBooking.guests[0]]);
    screen.getByText('Your Lightning Lane');
    screen.getByRole('heading', { name: sm.name });
    expect(screen.queryByText('Rebooking')).not.toBeInTheDocument();
  });
});
