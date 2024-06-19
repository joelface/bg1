import { fifi, mickey, minnie, pluto, rotr, wdw } from '@/__fixtures__/vq';
import { useNav } from '@/contexts/Nav';
import { click, loading, see } from '@/testing';

import ChooseParty from '../ChooseParty';
import JoinQueue from '../JoinQueue';

jest.mock('@/contexts/Nav');
jest.useFakeTimers();

describe('ChooseParty', () => {
  const { goTo } = useNav();

  it('shows VQ party selection screen', async () => {
    wdw.render(<ChooseParty queue={rotr} />);
    await loading();

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
