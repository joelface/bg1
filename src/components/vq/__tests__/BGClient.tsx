import { h } from 'preact';
import FakeTimers from '@sinonjs/fake-timers';

import { RequestError, VQClient } from '@/api/vq';
import { VQClientProvider } from '@/contexts/VQClient';
import { elemScrollMock, fireEvent, render, screen, waitFor } from '@/testing';
import { queues, guests } from '@/__fixtures__/vq';
import BGClient from '../BGClient';

const client = new VQClient({
  origin: 'https://vqguest-svc-wdw.wdprapps.disney.com',
  getAuthData: () => ({ accessToken: '' }),
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

async function setup() {
  render(
    <VQClientProvider value={client}>
      <BGClient />
    </VQClientProvider>
  );
  await screen.findByText('Pluto');
}

describe('BGClient', () => {
  const clock = FakeTimers.install({ shouldAdvanceTime: true });

  beforeEach(async () => {
    await setup();
  });

  it('scrolls to top on screen change', () => {
    click(confirmBtn());
    expect(elemScrollMock).toBeCalledWith(0, 0);
  });

  describe('ChooseParty screen', () => {
    it('toggles guest when clicked', () => {
      const pluto = screen.getByLabelText('Pluto');
      expect(pluto).not.toBeChecked();
      click(pluto);
      expect(pluto).toBeChecked();
      click(pluto);
      expect(pluto).not.toBeChecked();
    });

    it('updates queue and guest list when new queue selected', async () => {
      const pluto = screen.getByLabelText('Pluto');
      click(pluto);
      change(screen.getByDisplayValue(queues[0].name), {
        target: { value: queues[1].id },
      });
      expect(
        await screen.findByDisplayValue(queues[1].name)
      ).toBeInTheDocument();
      expect(pluto).not.toBeChecked();
    });

    it('goes to JoinQueue when Confirm Party button clicked', () => {
      expect(screen.getByText('Choose Your Party')).toBeInTheDocument();
      click(screen.getByText('Confirm Party'));
      expect(screen.getByText('Your Party')).toBeInTheDocument();
    });

    it('shows "Max party size" error when limit reached', async () => {
      const { maxPartySize } = queues[0];
      const errMsg = `Max party size: ${maxPartySize}`;
      const initPartySize = screen.getAllByRole('checkbox', {
        checked: true,
      }).length;
      const unchecked = screen.getAllByRole('checkbox', { checked: false });
      const numToCheck = maxPartySize - initPartySize;
      unchecked.slice(0, numToCheck).forEach(cb => click(cb));
      expect(screen.queryByText(errMsg)).not.toBeInTheDocument();
      click(unchecked[numToCheck]);
      expect(await screen.findByText(errMsg)).toBeInTheDocument();
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
