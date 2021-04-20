import { h } from 'preact';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';

import { queues, guests } from '../../__fixtures__/vq';
import BGClient from '../BGClient';

const { getByRole, getByLabelText } = screen;

process.on('unhandledRejection', () => null);

window.scrollTo = jest.fn();

const client = {
  getQueues: jest.fn(),
  getQueue: jest.fn(),
  joinQueue: jest.fn(),
  getLinkedGuests: jest.fn(),
};
client.getQueues.mockResolvedValue(queues);
client.getQueue.mockResolvedValue(queues[0]);
client.joinQueue.mockResolvedValue({
  boardingGroup: 33,
  conflicts: [],
  closed: false,
});
client.getLinkedGuests.mockResolvedValue(guests);

function queueOpen() {
  client.getQueue.mockResolvedValueOnce({
    ...queues[0],
    isAcceptingJoins: true,
  });
}

const { click } = fireEvent;
const confirmBtn = () => getByRole('button', { name: 'Confirm Party' });
const joinBtn = () => getByRole('button', { name: 'Join Boarding Group' });

describe('BGClient', () => {
  it('renders BGClient', async () => {
    render(<BGClient client={client} />);
    await waitFor(() =>
      expect(getByRole('heading', { level: 1 })).toHaveTextContent(
        queues[0].name
      )
    );

    click(confirmBtn());
    click(getByRole('button', { name: 'Edit' }));
    click(getByLabelText('Pluto'));
    click(confirmBtn());
    click(joinBtn());
    expect(client.getQueue).lastCalledWith(queues[0]);
    await waitFor(() => {
      expect(getByRole('alert')).toHaveTextContent('Queue not open yet');
    });

    queueOpen();
    client.joinQueue.mockRejectedValueOnce(new Error('Random error'));
    try {
      click(joinBtn());
    } catch (e) {
      console.log(e);
    }
    await waitFor(() => {
      expect(getByRole('alert')).toHaveTextContent('Error: try again');
    });

    queueOpen();
    click(joinBtn());
    await waitFor(() => {
      expect(getByRole('heading', { level: 2 })).toHaveTextContent(
        'Boarding Group: 33'
      );
    });
  });
});
