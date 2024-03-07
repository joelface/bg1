import { client, fifi, mickey, minnie, pluto, rotr } from '@/__fixtures__/vq';
import { useNav } from '@/contexts/Nav';
import { VQClientProvider } from '@/contexts/VQClient';
import { click, loading, render, see } from '@/testing';

import StartTime from '../../StartTime';
import ChooseParty from '../ChooseParty';
import JoinQueue from '../JoinQueue';

jest.mock('@/contexts/Nav');
jest.mock('../../StartTime');
jest.useFakeTimers();

describe('ChooseParty', () => {
  const { goTo } = useNav();

  it('shows VQ party selection screen', async () => {
    render(
      <VQClientProvider value={client}>
        <ChooseParty queue={rotr} />
      </VQClientProvider>
    );
    await loading();
    expect(StartTime).toHaveBeenLastCalledWith(
      { queue: rotr, screen: ChooseParty },
      {}
    );

    click(pluto.name);
    click(fifi.name);
    see('Maximum party size: 3');

    click(minnie.name);
    click('Confirm Party');
    expect(goTo).toHaveBeenLastCalledWith(
      <JoinQueue queue={rotr} guests={[mickey, pluto]} />
    );
  });
});
