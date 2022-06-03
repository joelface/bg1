import { h } from 'preact';
import FakeTimers from '@sinonjs/fake-timers';

import { RequestError, VQClient } from '@/api/vq';
import { ClientProvider } from '@/contexts/Client';
import { elemScrollMock, fireEvent, render, screen, waitFor } from '@/testing';
import { queues, guests } from '@/__fixtures__/vq';
import BGClient from '../BGClient';
import { pluto } from '@/__fixtures__/vq';

const client = new VQClient({
  origin: 'https://vqguest-svc-wdw.wdprapps.disney.com',
  authStore: {
    getData: () => ({ swid: '', accessToken: '' }),
    setData: () => null,
    deleteData: () => null,
  },
}) as jest.Mocked<VQClient>;
jest.spyOn(client, 'getQueues').mockResolvedValue(queues);
jest.spyOn(client, 'getQueue').mockResolvedValue(queues[1]);
jest.spyOn(client, 'joinQueue').mockResolvedValue({
  boardingGroup: 33,
  conflicts: [] as any,
  closed: false,
});
jest.spyOn(client, 'getLinkedGuests').mockResolvedValue(guests);

function queueOpen() {
  client.getQueue.mockResolvedValueOnce({
    ...queues[1],
    isAcceptingJoins: true,
  });
}

const { change, click } = fireEvent;
const confirmBtn = () => screen.getByText('Confirm Party');
const joinBtn = () => screen.getByText('Join Boarding Group');

const renderComponent = () =>
  render(
    <ClientProvider value={client}>
      <BGClient />
    </ClientProvider>
  );

function setup() {
  renderComponent();
}

describe('BGClient', () => {
  const clock = FakeTimers.install({ shouldAdvanceTime: true });

  beforeEach(setup);

  it('scrolls to top on screen change', () => {
    click(confirmBtn());
    expect(elemScrollMock).toBeCalledWith(0, 0);
  });

  it('shows message if no virtual queues', async () => {
    client.getQueues.mockResolvedValueOnce([]);
    renderComponent();
    await screen.findByText('No Virtual Queues');
  });

  describe('ChooseParty screen', () => {
    it('toggles guest when clicked', async () => {
      const lbl = await screen.findByLabelText(pluto.name);
      expect(lbl).not.toBeChecked();
      click(lbl);
      expect(lbl).toBeChecked();
      click(lbl);
      expect(lbl).not.toBeChecked();
    });

    it('updates queue and guest list when new queue selected', async () => {
      const lbl = await screen.findByLabelText(pluto.name);
      click(lbl);
      change(screen.getByDisplayValue(queues[0].name), {
        target: { value: queues[1].id },
      });
      expect(
        await screen.findByDisplayValue(queues[1].name)
      ).toBeInTheDocument();
      expect(lbl).not.toBeChecked();
    });

    it('goes to JoinQueue when Confirm Party button clicked', () => {
      expect(screen.getByText('Choose Your Party')).toBeInTheDocument();
      click(screen.getByText('Confirm Party'));
      expect(screen.getByText('Your Party')).toBeInTheDocument();
    });

    it('shows error when attempting to exceed max party size', async () => {
      const { maxPartySize } = queues[0];
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
      expect(await screen.findByText(errMsg)).toBeInTheDocument();
    });

    it('shows message if no guests', async () => {
      client.getLinkedGuests.mockResolvedValueOnce([]);
      renderComponent();
      await screen.findByText('No guests available');
    });
  });

  describe('JoinQueue screen', () => {
    beforeEach(() => {
      change(screen.getByDisplayValue(queues[0].name), {
        target: { value: queues[1].id },
      });
      click(confirmBtn());
    });

    it('returns to ChooseParty when Edit button clicked', () => {
      click(screen.getByText('Edit'));
      expect(screen.getByText('Choose Your Party')).toBeInTheDocument();
    });

    it('goes to BGResult when BG obtained', async () => {
      queueOpen();
      click(joinBtn());
      expect(await screen.findByText('Boarding Group: 33')).toBeInTheDocument();
      expect(screen.getByText(queues[1].name)).toBeInTheDocument();
      await clock.runToLastAsync();
      click(screen.getByText('Done'));
      expect(screen.getByText('Choose Your Party')).toBeInTheDocument();
    });

    it('shows "Queue not open yet" alert when queue closed', async () => {
      click(joinBtn());
      expect(await screen.findByText('Queue not open yet')).toBeInTheDocument();
      expect(joinBtn()).toBeDisabled();
      await clock.runToLastAsync();
      await waitFor(() => {
        expect(joinBtn()).toBeEnabled();
      });
    });

    it('shows "Error: try again" alert when request fails', async () => {
      queueOpen();
      client.joinQueue.mockRejectedValueOnce(
        new RequestError({ status: 404, data: { responseStatus: 'NOT_OK' } })
      );
      click(joinBtn());
      expect(await screen.findByText('Error: try again')).toBeInTheDocument();
    });
  });
});
