import { h } from 'preact';
import FakeTimers from '@sinonjs/fake-timers';

import { RequestError } from '@/api/genie';
import { GenieClientProvider } from '@/contexts/GenieClient';
import { click, render, screen, waitFor } from '@/testing';
import { client, hm, mk, bookings, mickey, donald } from '@/__fixtures__/genie';
import BookExperience from '../BookExperience';

const onClose = jest.fn();
const errorMock = jest.spyOn(console, 'error');
const clock = FakeTimers.install({
  shouldAdvanceTime: true,
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
  clock.runToLast();
};

const mockBook = (status: number) =>
  mockClickResponse(client.book, 'Book Lightning Lane', status);

const mockMakeRes = (status: number) =>
  mockClickResponse(client.plusExperiences, 'Check Availability', status);

const renderComponent = (available = true) =>
  render(
    <GenieClientProvider value={client}>
      <BookExperience
        experience={{
          ...hm,
          flex: { available, enrollmentStartTime: '07:00:00' },
        }}
        park={mk}
        onClose={onClose}
      />
    </GenieClientProvider>
  );

describe('BookExperience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('performs successful booking', async () => {
    renderComponent(false);
    await screen.findByText('Not Available Yet');
    click('Check Availability');
    await screen.findByText('11:25 AM');
    screen.getByText('12:25 PM');
    click('Edit');
    click('Mickey Mouse');
    click('Confirm Party');
    expect(screen.queryByText('Mickey Mouse')).not.toBeInTheDocument();
    screen.getByText('Minnie Mouse');
    click('Book Lightning Lane');
    await screen.findByText('Your Lightning Lane');
    screen.getByText(hm.name);
    click('Done');
    expect(client.cancelBooking).lastCalledWith(
      bookings[0].guests.filter(g => g.id === mickey.id)
    );
    expect(onClose).toBeCalledTimes(1);
  });

  it('refreshes offer when Refresh Offer button clicked', async () => {
    renderComponent();
    await screen.findByText('11:25 AM');
    client.offer.mockResolvedValueOnce({
      id: 'new_offer',
      start: { date: '2022-07-17', time: '10:05:00' },
      end: { date: '2022-07-17', time: '11:05:00' },
      changeStatus: 'NONE',
    });
    click('Refresh Offer');
    await screen.findByText('10:05 AM');
    screen.getByText('11:05 AM');
  });

  it('cancels offer and calls onClose when Cancel button clicked', async () => {
    renderComponent();
    await waitFor(() => click('Cancel'));
    expect(onClose).toBeCalledTimes(1);
    expect(client.cancelOffer).toBeCalledTimes(1);
  });

  it('shows "No Eligible Guests" when no guests', async () => {
    client.guests.mockResolvedValueOnce({
      guests: [],
      ineligibleGuests: [donald],
    });
    const { container } = renderComponent();
    await screen.findByText('No Eligible Guests');
    expect(container).toHaveTextContent(
      `${donald.name}${donald.ineligibleReason.replace(/_/g, ' ')}`
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
    clock.runToLast();
    await screen.findByText('Reservations not open yet');
    await mockMakeRes(0);
    await screen.findByText('Network request failed');
    await mockMakeRes(-1);
    await screen.findByText('Unknown error occurred');
  });
});
