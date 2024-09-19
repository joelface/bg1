import {
  booking,
  donald,
  hm,
  ll,
  mickey,
  minnie,
  offer,
  pluto,
  renderResort,
} from '@/__fixtures__/ll';
import { RequestError } from '@/api/client';
import { BookingDateProvider } from '@/contexts/BookingDate';
import { Nav } from '@/contexts/Nav';
import { RebookingContext } from '@/contexts/Rebooking';
import { parkDate } from '@/datetime';
import { ping } from '@/ping';
import { TODAY, click, loading, screen, see, setTime } from '@/testing';

import BookExperience from '../BookExperience';

jest.mock('@/ping');
jest.mock('@/timesync');
setTime('09:00');
const errorMock = jest.spyOn(console, 'error');

const mockClickResponse = async (
  clientMethod: jest.MockedFunction<any>,
  buttonText: string,
  status: number
) => {
  const error =
    status >= 0
      ? new RequestError({ ok: status === 200, status, data: {} })
      : new Error();
  errorMock.mockImplementationOnce(() => null);
  clientMethod.mockRejectedValueOnce(error);
  click(buttonText);
  await loading();
};

const mockBook = (status: number) =>
  mockClickResponse(ll.book, 'Book Lightning Lane', status);

async function clickModify() {
  click('Modify');
  await see.screen('Modify Party');
}

async function clickConfirm() {
  click('Confirm Party');
  await see.screen('Lightning Lane');
}

async function renderComponent({
  modify = false,
}: {
  modify?: boolean;
} = {}) {
  const rebooking = {
    current: modify ? booking : undefined,
    begin: jest.fn(),
    end: jest.fn(),
  };
  renderResort(
    <BookingDateProvider>
      <RebookingContext.Provider value={rebooking}>
        <Nav>
          <BookExperience experience={hm} />
        </Nav>
      </RebookingContext.Provider>
    </BookingDateProvider>
  );
  await loading();
}

describe('BookExperience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('performs successful booking', async () => {
    await renderComponent();
    see.time(offer.start.time);
    see.time(offer.end.time);
    await clickModify();
    click(mickey.name, 'checkbox');
    await clickConfirm();
    see.no(mickey.name);
    see(minnie.name);
    click('Book Lightning Lane');
    await loading();
    see('Your Lightning Lane');
    see(hm.name);
    expect(ping).toHaveBeenCalledTimes(1);
    expect(ll.guests).toHaveBeenCalledTimes(1);
    expect(ll.book).toHaveBeenCalledTimes(1);
    expect(ll.cancelBooking).toHaveBeenLastCalledWith(
      booking.guests.filter(g => g.id === mickey.id)
    );
  });

  it('removes offer-ineligible guests from selected party', async () => {
    ll.offer.mockResolvedValueOnce({
      ...offer,
      guests: {
        eligible: [minnie],
        ineligible: [mickey, pluto].map(g => ({
          ...g,
          ineligibleReason: 'TOO_EARLY_FOR_PARK_HOPPING',
        })),
      },
    });
    await renderComponent();
    see(minnie.name);
    see.no(mickey.name);
    await clickModify();
    screen.getByRole('checkbox', { checked: true });
    expect(see(mickey.name)).toHaveTextContent('TOO EARLY FOR PARK HOPPING');
    expect(see(pluto.name)).toHaveTextContent('TOO EARLY FOR PARK HOPPING');
  });

  const newOffer = {
    id: 'new_offer',
    start: { date: TODAY, time: '10:05:00' },
    end: { date: TODAY, time: '11:05:00' },
    active: true,
    changed: true,
    guests: {
      eligible: [mickey, minnie, pluto],
      ineligible: [],
    },
    experience: hm,
    booking: undefined,
  };

  it('refreshes offer when Refresh button clicked', async () => {
    await renderComponent();
    see.time(offer.start.time);
    ll.offer.mockResolvedValueOnce(newOffer);
    click('Refresh Offer');
    await loading();
    see.time(newOffer.start.time);
    see.no('Return time has been changed');
  });

  it('refreshes offer when someone added to party', async () => {
    await renderComponent();
    see.time(offer.start.time);
    ll.offer.mockResolvedValueOnce(newOffer);
    await clickModify();
    click(mickey.name, 'checkbox');
    await clickConfirm();
    see.no(mickey.name);
    await clickModify();
    click(mickey.name, 'checkbox');
    await clickConfirm();
    await loading();
    see(mickey.name);
    see.time(newOffer.start.time);
  });

  it('shows "No Guests Found" when no guests loaded', async () => {
    ll.guests.mockResolvedValueOnce({ eligible: [], ineligible: [] });
    await renderComponent();
    see('No Guests Found');

    click('Refresh Party');
    await loading();
    see(mickey.name);
  });

  it('shows "No Eligible Guests" when no eligible guests loaded', async () => {
    ll.guests.mockResolvedValueOnce({
      eligible: [],
      ineligible: [donald],
    });
    await renderComponent();
    see('No Eligible Guests');
    expect(see(donald.name)).toHaveTextContent(
      donald.ineligibleReason.replace(/_/g, ' ')
    );
  });

  it('shows "No Reservations Available" when no/invalid offer', async () => {
    ll.offer.mockRejectedValueOnce(
      new RequestError({ ok: false, status: 410, data: {} })
    );
    await renderComponent();
    see('No Reservations Available');

    ll.offer.mockResolvedValueOnce({ ...offer, active: false });
    click('Refresh Offer');
    await loading();
    see('No Reservations Available');
  });

  it('flashes error message when booking fails', async () => {
    await renderComponent();
    await mockBook(410);
    see('Offer expired');
    await mockBook(0);
    see('Network request failed');
    await mockBook(-1);
    see('Unknown error occurred');
  });

  it('limits offers to maxPartySize', async () => {
    const { maxPartySize } = ll.rules;
    (ll as any).rules.maxPartySize = 2;

    await renderComponent();
    expect(ll.offer).toHaveBeenLastCalledWith(hm, [mickey, minnie], {
      date: parkDate(),
    });
    see('Party size restricted');

    await clickModify();
    click(pluto.name);
    see('Selection limit reached');

    (ll as any).rules.maxPartySize = maxPartySize;
  });

  it('can modify an existing reservation', async () => {
    await renderComponent({ modify: true });
    expect(ll.guests).not.toHaveBeenCalled();
  });
});
