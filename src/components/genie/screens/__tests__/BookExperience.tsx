import {
  booking,
  client,
  donald,
  hm,
  mickey,
  minnie,
  offer,
  pluto,
} from '@/__fixtures__/genie';
import { RequestError } from '@/api/genie';
import { ClientProvider } from '@/contexts/Client';
import { ping } from '@/ping';
import { TODAY, click, loading, render, screen, setTime } from '@/testing';

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
    experience: hm,
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

  it("doesn't request offer when party modified before enrollment opens", async () => {
    client.offer.mockClear();
    await renderComponent(false);
    click('Edit');
    click(mickey.name);
    click('Confirm Party');
    expect(client.offer).not.toBeCalled();
  });

  it('cancels offer and calls onClose when Back button clicked', async () => {
    await renderComponent();
    screen.getByText('Arrive by:');
    click('Back');
    expect(onClose).toBeCalledTimes(1);
    expect(client.cancelOffer).toBeCalledTimes(1);
  });

  it('shows prebooking screen even if no eligible guests', async () => {
    client.guests.mockResolvedValueOnce({
      eligible: [],
      ineligible: [
        { ...mickey, ineligibleReason: 'INVALID_PARK_ADMISSION' },
        { ...minnie, ineligibleReason: 'INVALID_PARK_ADMISSION' },
      ],
    });
    await renderComponent(false);
    screen.getByText('07:00:00');
    screen.getByText('Ineligible Guests');
    screen.getByText(mickey.name);
    screen.getByText(minnie.name);
    expect(screen.getAllByText('INVALID PARK ADMISSION')).toHaveLength(2);
    screen.getByRole('button', { name: 'Check Availability' });
    screen.getByRole('button', { name: 'Back' });
  });

  it('shows "No Guests Found" when no guests loaded', async () => {
    client.guests.mockResolvedValueOnce({ eligible: [], ineligible: [] });
    await renderComponent();
    screen.getByText('No Guests Found');
    screen.getByText('Back');
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
    expect(screen.getByText('Back')).toHaveClass('w-full');
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
    expect(screen.getByText('Back')).toHaveClass('w-full');

    click('Edit');
    click(minnie.name);
    click('Confirm Party');
    await loading();
    expect(client.offer).toBeCalledTimes(2);
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
      { ...hm, flex: { available: true, enrollmentStartTime: '07:00:00' } },
      eligible.slice(0, client.maxPartySize),
      undefined
    );
  });
});
