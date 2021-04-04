import { h } from 'preact';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';

import { queues, guests } from '../../__fixtures__/vq';
import BGClient from '../BGClient';

const { getByRole } = screen;

window.scrollTo = jest.fn();

const client = {
  getQueues: jest.fn(),
  getQueue: jest.fn(),
  joinQueue: jest.fn(),
  getLinkedGuests: jest.fn(),
};
client.getQueues.mockResolvedValue(queues);
client.getQueue.mockResolvedValue(queues[0]);
client.getLinkedGuests.mockResolvedValue(guests);

describe('BGClient', () => {
  it('renders BGClient', async () => {
    render(<BGClient client={client} />);
    await waitFor(() =>
      expect(getByRole('heading', { level: 1 })).toHaveTextContent(
        queues[0].name
      )
    );

    fireEvent.click(getByRole('button', { name: 'Confirm Party' }));
    const joinBtn = getByRole('button', { name: 'Join Boarding Group' });
    expect(joinBtn).toBeInTheDocument();

    fireEvent.click(joinBtn);
    expect(client.getQueue).toHaveBeenCalledWith(queues[0]);

    fireEvent.click(getByRole('button', { name: 'Edit' }));
    expect(getByRole('button', { name: 'Confirm Party' })).toBeInTheDocument();
  });
});
