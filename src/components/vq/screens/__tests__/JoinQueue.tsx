import { client, mickey, pluto, rotr } from '@/__fixtures__/vq';
import TimeBoard from '@/components/TimeBoard';
import { useNav } from '@/contexts/Nav';
import { VQClientProvider } from '@/contexts/VQClient';
import { click, loading, render, see } from '@/testing';

import BGResult from '../BGResult';
import JoinQueue from '../JoinQueue';

jest.mock('@/components/TimeBoard');
jest.mock('@/contexts/Nav');
jest.mock('@/ping');
jest.useFakeTimers();

async function clickJoin() {
  click('Join Virtual Queue');
  await loading();
}

const guests = [mickey, pluto];

describe('JoinQueue', () => {
  const { goTo } = useNav();

  it('shows VQ join screen', async () => {
    const { container } = render(
      <VQClientProvider value={client}>
        <JoinQueue queue={rotr} guests={guests} />
      </VQClientProvider>
    );
    expect(TimeBoard).toHaveBeenLastCalledWith(
      { time: rotr.nextScheduledOpenTime, label: 'Next queue opening' },
      {}
    );
    expect(container).toHaveTextContent(
      'Tap the Join Virtual Queue button when the clock reads 07:00:00.'
    );

    await clickJoin();
    see('Queue not open yet');

    client.getQueues.mockResolvedValueOnce([
      { ...rotr, isAcceptingJoins: true },
    ]);
    await clickJoin();
    expect(goTo).toHaveBeenLastCalledWith(
      <BGResult
        queue={rotr}
        guests={guests}
        result={expect.objectContaining({ boardingGroup: 33 })}
      />,
      { replace: true }
    );
  });

  it('shows "No boarding groups available" message when VQ closed', async () => {
    render(
      <VQClientProvider value={client}>
        <JoinQueue queue={rotr} guests={guests} />
      </VQClientProvider>
    );
    client.getQueues.mockResolvedValueOnce([
      { ...rotr, isAcceptingPartyCreation: false },
    ]);
    await clickJoin();
    see('No boarding groups available');
  });
});
