import { RequestError } from '/api/genie';
import { ClientProvider } from '/contexts/Client';
import { RebookingProvider } from '/contexts/Rebooking';
import { click, loading, render, screen, waitFor } from '/testing';
import {
  client,
  hm,
  jc,
  mk,
  booking,
  mickey,
  minnie,
  donald,
} from '/__fixtures__/genie';
import BookExperience from '../BookExperience';

const onClose = jest.fn();
const errorMock = jest.spyOn(console, 'error');
jest.useFakeTimers({
  advanceTimers: true,
});

const mockClickResponse = async (
  clientMethod: jest.MockedFunction<any>,
  buttonText: string,
  status: number
) => {
  const error =
    status >= 0 ? new RequestError({ status, data: {} }) : new Error();
  errorMock.mockImplementationOnce(() => null);
  clientMethod.mockRejectedValueOnce(error);
  await waitFor(() => click(buttonText));
  jest.runOnlyPendingTimers();
};

const mockBook = (status: number) =>
  mockClickResponse(client.book, 'Book Lightning Lane', status);

const mockMakeRes = (status: number) =>
  mockClickResponse(client.plusExperiences, 'Check Availability', status);

const renderComponent = (available = true) => {
  render(
    <ClientProvider value={client}>
      <BookExperience
        experience={{
          ...hm,
          flex: { available, enrollmentStartTime: '07:00:00' },
        }}
        park={mk}
        onClose={onClose}
      />
    </ClientProvider>
  );
};

describe('BookExperience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('performs successful booking', async () => {
    renderComponent(false);
    await loading();
    await screen.findByText('Not Available Yet');
    click('Check Availability');
    await loading();
    await screen.findByText('11:25 AM');
    screen.getByText('12:25 PM');
    click('Edit');
    click(mickey.name);
    click('Confirm Party');
    expect(screen.queryByText(mickey.name)).not.toBeInTheDocument();
    screen.getByText(minnie.name);
    click('Book Lightning Lane');
    await loading();
    // jest.runOnlyPendingTimers();
    await screen.findByText('Your Lightning Lane');
    screen.getByText(hm.name);
    click('Done');
    expect(client.cancelBooking).lastCalledWith(
      booking.guests.filter(g => g.id === mickey.id)
    );
    expect(onClose).toBeCalledTimes(1);
  });

  const newOffer = {
    id: 'new_offer',
    start: { date: '2022-07-17', time: '10:05:00' },
    end: { date: '2022-07-17', time: '11:05:00' },
    changeStatus: 'NONE' as const,
  };

  it('refreshes offer when Refresh Offer button clicked', async () => {
    renderComponent();
    await screen.findByText('11:25 AM');
    client.offer.mockResolvedValueOnce(newOffer);
    click('Refresh Offer');
    await screen.findByText('10:05 AM');
    screen.getByText('11:05 AM');
  });

  it('refreshes offer when someone added to party', async () => {
    renderComponent();
    await screen.findByText('11:25 AM');
    client.offer.mockResolvedValueOnce(newOffer);
    click('Edit');
    click(mickey.name);
    click('Confirm Party');
    click('Edit');
    click(mickey.name);
    click('Confirm Party');
    jest.runOnlyPendingTimers();
    await screen.findByText('10:05 AM');
  });

  it('cancels offer and calls onClose when Cancel button clicked', async () => {
    renderComponent();
    await screen.findByText('Arrive by:');
    await waitFor(() => click('Cancel'));
    expect(onClose).toBeCalledTimes(1);
    expect(client.cancelOffer).toBeCalledTimes(1);
  });

  it('shows "No Guests Found" when no guests loaded', async () => {
    client.guests.mockResolvedValueOnce({ eligible: [], ineligible: [] });
    renderComponent();
    await screen.findByText('No Guests Found');
  });

  it('shows "No Eligible Guests" when no eligible guests loaded', async () => {
    client.guests.mockResolvedValueOnce({
      eligible: [],
      ineligible: [donald],
    });
    renderComponent();
    jest.runOnlyPendingTimers();
    await screen.findByText('No Eligible Guests');
    expect(screen.getByText(donald.name)).toHaveTextContent(
      donald.ineligibleReason.replace(/_/g, ' ')
    );
  });

  it('shows "No Reservations Available" when no offer', async () => {
    client.offer.mockRejectedValueOnce(
      new RequestError({ status: 410, data: {} })
    );
    renderComponent();
    await waitFor(() => expect(client.offer).toBeCalledTimes(1));
    await screen.findByText('No Reservations Available');
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
            park={mk}
            onClose={onClose}
          />
        </RebookingProvider>
      </ClientProvider>
    );
    jest.runOnlyPendingTimers();
    await screen.findByText('Unable to Rebook');
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
    renderComponent();
    await mockBook(410);
    await screen.findByText('Offer expired');
    await mockBook(0);
    await screen.findByText('Network request failed');
    await mockBook(-1);
    await screen.findByText('Unknown error occurred');
  });

  it('flashes error message when enrollment not open or enrollment check fails', async () => {
    renderComponent(false);
    client.plusExperiences.mockResolvedValueOnce([
      { ...hm, flex: { available: false } },
    ]);
    await waitFor(() => click('Check Availability'));
    jest.runOnlyPendingTimers();
    await screen.findByText('Reservations not open yet');
    await mockMakeRes(0);
    await screen.findByText('Network request failed');
    await mockMakeRes(-1);
    await screen.findByText('Unknown error occurred');
  });

  it('limits offers to maxPartySize', async () => {
    const eligible = [...Array(client.maxPartySize + 5).keys()]
      .map(String)
      .map(id => ({ id, name: id }));
    client.guests.mockResolvedValueOnce({ eligible, ineligible: [] });
    renderComponent();
    await waitFor(() => expect(client.offer).toBeCalledTimes(1));
    expect(client.offer).lastCalledWith(
      expect.objectContaining({
        guests: eligible.slice(0, client.maxPartySize),
      })
    );
  });
});
