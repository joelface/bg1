import { RequestError, VQClient } from '/api/vq';
import { ClientProvider } from '/contexts/Client';
import { act, fireEvent, click, render, screen, waitFor } from '/testing';
import { queues, rotr, santa, guests, pluto } from '/__fixtures__/vq';
import BGClient from '../BGClient';

jest.useFakeTimers({ advanceTimers: true });

const client = new VQClient({
  origin: 'https://vqguest-svc-wdw.wdprapps.disney.com',
  authStore: {
    getData: () => ({ swid: '', accessToken: '' }),
    setData: () => null,
    deleteData: () => null,
  },
}) as jest.Mocked<VQClient>;
jest.spyOn(client, 'getQueues').mockResolvedValue(queues);
jest.spyOn(client, 'getQueue').mockResolvedValue(santa);
jest.spyOn(client, 'joinQueue').mockResolvedValue({
  boardingGroup: 33,
  conflicts: [] as any,
  closed: false,
});
jest.spyOn(client, 'getLinkedGuests').mockResolvedValue(guests);

function queueOpen() {
  client.getQueue.mockResolvedValueOnce({
    ...santa,
    isAcceptingJoins: true,
  });
}

const { change } = fireEvent;
const CONFIRM = 'Confirm Party';
const JOIN = 'Join Boarding Group';
const REFRESH = 'Refresh';

let hidden = false;
Object.defineProperty(document, 'hidden', { get: () => hidden });

function toggleVisibility() {
  hidden = !hidden;
  document.dispatchEvent(new Event('visibilitychange'));
}

const renderComponent = () => {
  render(
    <ClientProvider value={client}>
      <BGClient />
    </ClientProvider>
  );
};

describe('BGClient', () => {
  it('shows message if no active queues', async () => {
    client.getQueues.mockResolvedValueOnce([]);
    renderComponent();
    await screen.findByText('No Active Queues');
    client.getQueues.mockResolvedValueOnce([]);
    click(REFRESH);
    await screen.findByText('No queues available');
    click(REFRESH);
    await screen.findByText(rotr.name);
    expect(screen.getAllByRole('option').map(opt => opt.textContent)).toEqual([
      rotr.name,
      santa.name,
    ]);
  });

  it('switches to first available queue if current one is no longer available', async () => {
    client.getQueues.mockClear();
    renderComponent();
    expect(
      (await screen.findAllByRole('option')).map(opt => opt.textContent)
    ).toEqual([rotr.name, santa.name]);
    expect(client.getQueues).toBeCalledTimes(1);
    client.getQueues.mockResolvedValueOnce([santa]);
    toggleVisibility();
    act(() => {
      toggleVisibility();
    });
    await waitFor(() => expect(client.getQueues).toBeCalledTimes(2));
    await screen.findByRole('heading', { name: santa.name });
  });

  describe('ChooseParty screen', () => {
    it('toggles guest when clicked', async () => {
      renderComponent();
      const cbx = await screen.findByLabelText(pluto.name);
      expect(cbx).not.toBeChecked();
      click(cbx);
      expect(cbx).toBeChecked();
      click(cbx);
      expect(cbx).not.toBeChecked();
    });

    it('updates queue and guest list when new queue selected', async () => {
      renderComponent();
      await waitFor(() => click(pluto.name));
      change(screen.getByDisplayValue(rotr.name), {
        target: { value: santa.id },
      });
      await screen.findByDisplayValue(santa.name);
      expect(await screen.findByLabelText(pluto.name)).not.toBeChecked();
    });

    it('goes to JoinQueue when Confirm Party button clicked', async () => {
      renderComponent();
      await screen.findByText(CONFIRM);
      click(CONFIRM);
      screen.getByText('Your Party');
    });

    it('shows error when attempting to exceed max party size', async () => {
      renderComponent();
      const { maxPartySize } = rotr;
      const errMsg = `Maximum party size: ${maxPartySize}`;
      const checked = await screen.findAllByRole('checkbox', {
        checked: true,
      });
      const initPartySize = checked.length;
      const unchecked = screen.getAllByRole('checkbox', { checked: false });
      const numToCheck = maxPartySize - initPartySize;
      unchecked.slice(0, numToCheck).forEach(cb => click(cb));
      expect(screen.queryByText(errMsg)).not.toBeInTheDocument();
      click(unchecked[numToCheck]);
      await screen.findByText(errMsg);
      act(() => {
        jest.runOnlyPendingTimers();
      });
      expect(screen.queryByText(errMsg)).not.toBeInTheDocument();
    });

    it('shows message if no guests', async () => {
      client.getLinkedGuests.mockResolvedValueOnce([]);
      renderComponent();
      await screen.findByText('No guests available');
    });
  });

  describe('JoinQueue screen', () => {
    async function renderAndConfirm() {
      renderComponent();
      change(await screen.findByDisplayValue(rotr.name), {
        target: { value: santa.id },
      });
      await screen.findByText(pluto.name);
      click(CONFIRM);
      screen.getByText('Your Party');
    }

    it('returns to ChooseParty when Edit button clicked', async () => {
      await renderAndConfirm();
      click('Edit');
      screen.getByText('Choose Your Party');
    });

    it('goes to BGResult when BG obtained', async () => {
      await renderAndConfirm();
      queueOpen();
      click(JOIN);
      await screen.findByText('Boarding Group: 33');
      screen.getByText(santa.name);
      act(() => {
        jest.runOnlyPendingTimers();
      });
      await waitFor(() => click('Done'));
      screen.getByText('Choose Your Party');
    });

    it('shows "Queue not open yet" alert when queue closed', async () => {
      await renderAndConfirm();
      const joinBtn = screen.getByText(JOIN);
      click(joinBtn);
      await screen.findByText('Queue not open yet');
      expect(joinBtn).toBeDisabled();
      act(() => {
        jest.runOnlyPendingTimers();
      });
      await waitFor(() => expect(joinBtn).toBeEnabled());
    });

    it('shows "Error: try again" alert when request fails', async () => {
      await renderAndConfirm();
      queueOpen();
      client.joinQueue.mockRejectedValueOnce(
        new RequestError({ status: 404, data: { responseStatus: 'NOT_OK' } })
      );
      click(JOIN);
      await screen.findByText('Error: try again');
    });
  });
});
