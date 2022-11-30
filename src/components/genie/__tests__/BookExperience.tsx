import { RequestError } from '@/api/genie';
import { ClientProvider } from '@/contexts/Client';
import { RebookingProvider } from '@/contexts/Rebooking';
import { ping } from '@/ping';
import { click, loading, render, screen, setTime, TODAY } from '@/testing';
import {
  client,
  offer,
  hm,
  jc,
  booking,
  mickey,
  minnie,
  donald,
  pluto,
} from '@/__fixtures__/genie';
import BookExperience from '../BookExperience';

jest.mock('@/ping');

const onClose = jest.fn();
const errorMock = jest.spyOn(console, 'error');
setTime('09:00');

const mockClickResponse = async (
  clientMethod: jest.MockedFunction<any>,
  buttonText: string,
  status: number
) => {
  const error =
    status >= 0 ? new RequestError({ status, data: {} }) : new Error();
  errorMock.mockImplementationOnce(() => null);
  clientMethod.mockRejectedValueOnce(error);
  click(buttonText);
  await loading();
};

const mockBook = (status: number) =>
  mockClickResponse(client.book, 'Book Lightning Lane', status);

const mockMakeRes = (status: number) =>
  mockClickResponse(client.experiences, 'Check Availability', status);

const renderComponent = async (available = true) => {
  render(
    <ClientProvider value={client}>
      <BookExperience
        experience={{
          ...hm,
          flex: { available, enrollmentStartTime: '07:00:00' },
        }}
        onClose={onClose}
      />
    </ClientProvider>
  );
  await loading();
};

describe('BookExperience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('performs successful booking', async () => {
    await renderComponent(false);
    screen.getByText('Not Available Yet');
    click('Check Availability');
    await loading();
    screen.getByText('11:25 AM - 12:25 PM');
    click('Edit');
    click(mickey.name);
    click('Confirm Party');
    expect(screen.queryByText(mickey.name)).not.toBeInTheDocument();
    screen.getByText(minnie.name);
    click('Book Lightning Lane');
    await loading();
    screen.getByText('Your Lightning Lane');
    screen.getByText(hm.name);
    expect(ping).toBeCalledTimes(1);
    click('Done');
    expect(client.guests).toBeCalledTimes(1);
    expect(client.book).toBeCalledTimes(1);
    expect(client.cancelBooking).lastCalledWith(
      booking.guests.filter(g => g.id === mickey.id)
    );
    expect(onClose).toBeCalledTimes(1);
  });

  it('removes offer-ineligible guests from selected party', async () => {
    client.offer.mockResolvedValueOnce({
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
    screen.getByText(minnie.name);
    expect(screen.queryByText(mickey.name)).not.toBeInTheDocument();
    click('Edit');
    screen.getByRole('checkbox', { checked: true });
    expect(screen.getByText(mickey.name)).toHaveTextContent(
      'TOO EARLY FOR PARK HOPPING'
    );
    expect(screen.getByText(pluto.name)).toHaveTextContent(
      'TOO EARLY FOR PARK HOPPING'
    );
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
  };

  it('refreshes offer when Refresh Offer button clicked', async () => {
    await renderComponent();
    screen.getByText('11:25 AM - 12:25 PM');
    client.offer.mockResolvedValueOnce(newOffer);
    click('Refresh Offer');
    await loading();
    screen.getByText('10:05 AM - 11:05 AM');
    expect(
      screen.queryByText('Return time has been changed')
    ).not.toBeInTheDocument();
  });

  it('refreshes offer when someone added to party', async () => {
    await renderComponent();
    screen.getByText('11:25 AM - 12:25 PM');
    client.offer.mockResolvedValueOnce(newOffer);
    click('Edit');
    click(mickey.name);
    click('Confirm Party');
    click('Edit');
    click(mickey.name);
    click('Confirm Party');
    await loading();
    screen.getByText('10:05 AM - 11:05 AM');
  });

  it('cancels offer and calls onClose when Cancel button clicked', async () => {
    await renderComponent();
    screen.getByText('Arrive by:');
    click('Cancel');
    expect(onClose).toBeCalledTimes(1);
    expect(client.cancelOffer).toBeCalledTimes(1);
  });

  it('shows "No Guests Found" when no guests loaded', async () => {
    client.guests.mockResolvedValueOnce({ eligible: [], ineligible: [] });
    await renderComponent();
    screen.getByText('No Guests Found');
    screen.getByText('Cancel');
    expect(screen.queryByTitle('Refresh Offer')).not.toBeInTheDocument();
  });

  it('shows "No Eligible Guests" when no eligible guests loaded', async () => {
    client.guests.mockResolvedValueOnce({
      eligible: [],
      ineligible: [donald],
    });
    await renderComponent();
    screen.getByText('No Eligible Guests');
    expect(screen.getByText(donald.name)).toHaveTextContent(
      donald.ineligibleReason.replace(/_/g, ' ')
    );
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Refresh Offer')).not.toBeInTheDocument();
  });

  it('shows "No Reservations Available" when no offer', async () => {
    client.offer.mockRejectedValueOnce(
      new RequestError({ status: 410, data: {} })
    );
    await renderComponent();
    expect(client.offer).toBeCalledTimes(1);
    screen.getByText('No Reservations Available');
    screen.getByTitle('Refresh Offer');
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();

    click('Edit');
    click(minnie.name);
    click('Confirm Party');
    await loading();
    expect(client.offer).toBeCalledTimes(2);
  });

  it('shows "Unable to Rebook" if any guest has conflict while rebooking', async () => {
    const { guests } = booking;
    client.guests.mockResolvedValueOnce({
      eligible: [booking.guests[0]],
      ineligible: [
        {
          ...guests[1],
          ineligibleReason: 'TOO_EARLY',
          eligibleAfter: '13:00:00',
        },
        {
          ...guests[2],
          ineligibleReason: 'EXPERIENCE_LIMIT_REACHED',
        },
      ],
    });
    render(
      <ClientProvider value={client}>
        <RebookingProvider
          value={{ current: booking, begin: () => null, end: () => null }}
        >
          <BookExperience
            experience={{
              ...jc,
              flex: { available: true, enrollmentStartTime: '07:00:00' },
            }}
            onClose={onClose}
          />
        </RebookingProvider>
      </ClientProvider>
    );
    await loading();
    screen.getByText('Unable to Rebook');
    expect(screen.getByText(guests[0].name)).toHaveTextContent(
      'ELIGIBLE FOR NEW BOOKING'
    );
    expect(screen.getByText(guests[2].name)).toHaveTextContent(
      'EXPERIENCE LIMIT REACHED'
    );
    screen.getByText(guests[2].name);
    expect(screen.queryByText(guests[1].name)).not.toBeInTheDocument();
  });

  it('flashes error message when booking fails', async () => {
    await renderComponent();
    await mockBook(410);
    screen.getByText('Offer expired');
    await mockBook(0);
    screen.getByText('Network request failed');
    await mockBook(-1);
    screen.getByText('Unknown error occurred');
  });

  it('flashes error message when enrollment not open or enrollment check fails', async () => {
    client.experiences.mockResolvedValueOnce([
      { ...hm, flex: { available: false } },
    ]);
    await renderComponent(false);
    click('Check Availability');
    await loading();
    screen.getByText('Reservations not open yet');
    await mockMakeRes(0);
    screen.getByText('Network request failed');
    await mockMakeRes(-1);
    screen.getByText('Unknown error occurred');
  });

  it('limits offers to maxPartySize', async () => {
    const eligible = [...Array(client.maxPartySize + 5).keys()]
      .map(String)
      .map(id => ({ id, name: id }));
    client.guests.mockResolvedValueOnce({ eligible, ineligible: [] });
    await renderComponent();
    expect(client.offer).toBeCalledTimes(1);
    expect(client.offer).lastCalledWith(
      expect.objectContaining({
        guests: eligible.slice(0, client.maxPartySize),
      })
    );
  });
});
