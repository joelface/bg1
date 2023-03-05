import { client, mickey, pluto, rotr } from '@/__fixtures__/vq';
import { ClientProvider } from '@/contexts/Client';
import { useNav } from '@/contexts/Nav';
import { click, loading, render, see } from '@/testing';

import StartTime from '../../StartTime';
import BGResult from '../BGResult';
import JoinQueue from '../JoinQueue';

jest.mock('@/contexts/Nav');
jest.mock('@/ping');
jest.mock('../../StartTime');
jest.useFakeTimers();

async function clickJoin() {
  click('Join Virtual Queue');
  await loading();
}

describe('JoinQueue', () => {
  const { goTo } = useNav();

  it('shows VQ join screen', async () => {
    const guests = [mickey, pluto];
    render(
      <ClientProvider value={client}>
        <JoinQueue queue={rotr} guests={guests} />
      </ClientProvider>
    );
    expect(StartTime).lastCalledWith({ queue: rotr, screen: JoinQueue }, {});

    await clickJoin();
    see('Queue not open yet');

    client.getQueues.mockResolvedValueOnce([
      { ...rotr, isAcceptingJoins: true },
    ]);
    await clickJoin();
    expect(goTo).lastCalledWith(
      <BGResult
        queue={rotr}
        guests={guests}
        result={expect.objectContaining({ boardingGroup: 33 })}
      />,
      { replace: true }
    );
  });
});
