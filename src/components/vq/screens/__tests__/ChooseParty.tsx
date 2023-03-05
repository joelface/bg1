import { client, fifi, mickey, minnie, pluto, rotr } from '@/__fixtures__/vq';
import { ClientProvider } from '@/contexts/Client';
import { useNav } from '@/contexts/Nav';
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
      <ClientProvider value={client}>
        <ChooseParty queue={rotr} />
      </ClientProvider>
    );
    await loading();
    expect(StartTime).lastCalledWith({ queue: rotr, screen: ChooseParty }, {});

    click(pluto.name);
    click(fifi.name);
    see('Maximum party size: 3');

    click(minnie.name);
    click('Confirm Party');
    expect(goTo).lastCalledWith(
      <JoinQueue queue={rotr} guests={[mickey, pluto]} />
    );
  });
});
