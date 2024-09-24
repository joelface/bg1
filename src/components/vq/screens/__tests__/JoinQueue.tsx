import { mickey, pluto, renderResort, rotr, vq } from '@/__fixtures__/vq';
import TimeBoard from '@/components/TimeBoard';
import { useNav } from '@/contexts/Nav';
import { click, loading, see } from '@/testing';

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

describe('JoinQueue', () => {
  const { goTo } = useNav();

  const guests = [mickey, pluto];

  it('shows VQ join screen', async () => {
    const { container } = renderResort(
      <JoinQueue queue={rotr} guests={guests} />
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

    jest
      .spyOn(vq, 'getQueues')
      .mockResolvedValueOnce([{ ...rotr, isAcceptingJoins: true }]);
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
    renderResort(<JoinQueue queue={rotr} guests={guests} />);
    jest
      .spyOn(vq, 'getQueues')
      .mockResolvedValueOnce([{ ...rotr, isAcceptingPartyCreation: false }]);
    await clickJoin();
    see('No boarding groups available');
  });

  it('instructs user to join now if queue is open', async () => {
    renderResort(
      <JoinQueue queue={{ ...rotr, isAcceptingJoins: true }} guests={guests} />
    );
    see('The virtual queue is open. Join now!');
  });
});
