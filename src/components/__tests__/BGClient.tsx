import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';

import { queues, guests } from '../../__fixtures__/vq';
import BGClient from '../BGClient';

const { findByRole } = screen;

window.scrollTo = jest.fn();

const client = {
  getQueues: jest.fn(),
  isQueueOpen: jest.fn(),
  joinQueue: jest.fn(),
  getLinkedGuests: jest.fn(),
};
client.getQueues.mockResolvedValue(queues);
client.isQueueOpen.mockResolvedValue(false);
client.getLinkedGuests.mockResolvedValue(guests);

describe('BGClient', () => {
  it('renders BGClient', async () => {
    render(<BGClient client={client} />);
    expect(await findByRole('heading', { level: 1 })).toHaveTextContent(
      queues[0].name
    );
    fireEvent.click(await findByRole('button', { name: 'Confirm Party' }));
    const joinBtn = await findByRole('button', { name: 'Join Boarding Group' });
    expect(joinBtn).toBeInTheDocument();
    fireEvent.click(joinBtn);
    expect(client.isQueueOpen).toHaveBeenCalledWith(queues[0]);
    fireEvent.click(await findByRole('button', { name: 'Edit' }));
    expect(
      await findByRole('button', { name: 'Confirm Party' })
    ).toBeInTheDocument();
  });
});
