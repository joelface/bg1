import { h } from 'preact';
import FakeTimers from '@sinonjs/fake-timers';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';

import { queues, guests } from '../../__fixtures__/vq';
import { RequestError } from '../../virtual-queue';
import BGClient from '../BGClient';

jest.spyOn(self, 'scrollTo').mockImplementation();

const client = {
  resort: 'WDW' as const,
  url: jest.fn(),
  getQueues: jest.fn(),
  getQueue: jest.fn(),
  joinQueue: jest.fn(),
  getLinkedGuests: jest.fn(),
};
client.getQueues.mockResolvedValue(queues);
client.getQueue.mockResolvedValue(queues[1]);
client.joinQueue.mockResolvedValue({
  boardingGroup: 33,
  conflicts: [],
  closed: false,
});
client.getLinkedGuests.mockResolvedValue(guests);

function queueOpen() {
  client.getQueue.mockResolvedValueOnce({
    ...queues[1],
    isAcceptingJoins: true,
  });
}

const { change, click } = fireEvent;
const confirmBtn = () => screen.getByText('Confirm Party');
const joinBtn = () => screen.getByText('Join Boarding Group');

describe('BGClient', () => {
  beforeEach(async () => {
    render(<BGClient client={client} />);
    await screen.findByText('Pluto');
  });

  it('scrolls to top on screen change', () => {
    click(confirmBtn());
    expect(self.scrollTo).toBeCalledWith(0, 0);
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
        target: { value: queues[1].queueId },
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
  });

  describe('JoinQueue screen', () => {
    beforeEach(() => {
      change(screen.getByDisplayValue(queues[0].name), {
        target: { value: queues[1].queueId },
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
      click(screen.getByText('Done'));
      expect(screen.getByText('Choose Your Party')).toBeInTheDocument();
    });

    it('shows "Queue not open yet" alert when queue closed', async () => {
      const clock = FakeTimers.install();
      click(joinBtn());
      expect(await screen.findByText('Queue not open yet')).toBeInTheDocument();
      expect(joinBtn()).toBeDisabled();
      clock.runAll();
      await waitFor(() => {
        expect(joinBtn()).toBeEnabled();
      });
      clock.uninstall();
    });

    it('shows "Error: try again" alert when request fails', async () => {
      queueOpen();
      client.joinQueue.mockRejectedValueOnce(
        new RequestError({ responseStatus: 'NOT_OK' })
      );
      click(joinBtn());
      expect(await screen.findByText('Error: try again')).toBeInTheDocument();
    });
  });
});
