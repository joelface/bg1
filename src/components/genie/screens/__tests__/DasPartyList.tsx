import { booking, mickey, minnie, party } from '@/__fixtures__/das';
import { client } from '@/__fixtures__/genie';
import { DasParty } from '@/api/das';
import { DasBooking } from '@/api/genie';
import { GenieClientProvider } from '@/contexts/GenieClient';
import { Nav } from '@/contexts/Nav';
import { PlansProvider, usePlansState } from '@/contexts/Plans';
import { click, loading, render, see, setTime } from '@/testing';

import DasPartyList from '../DasPartyList';

setTime('10:00');

const donald = {
  id: 'donald',
  name: 'Donald Duck',
  primary: true,
};

const daisy = {
  id: 'daisy',
  name: 'Daisy Duck',
};

const parties: DasParty[] = [party, [donald, daisy]];

function DasPartyListTest({ parties }: { parties: DasParty[] }) {
  return (
    <PlansProvider value={usePlansState()}>
      <Nav>
        <DasPartyList parties={parties} />
      </Nav>
    </PlansProvider>
  );
}

async function renderComponent(parties: DasParty[], plans: DasBooking[]) {
  client.bookings.mockResolvedValueOnce([]);
  client.bookings.mockResolvedValueOnce(plans);
  render(
    <GenieClientProvider value={client}>
      <DasPartyListTest parties={parties} />
    </GenieClientProvider>
  );
  await loading();
}

describe('DasPartyList', () => {
  it('shows DAS selection details if active selection', async () => {
    await renderComponent([party], [booking]);
    see('Your DAS Selection');
    see(mickey.name);
    see(minnie.name);
  });

  it('shows DAS booking screen if no active selection', async () => {
    await renderComponent([party], []);
    see('DAS Selection');
    see(mickey.name);
    see(minnie.name);
  });

  it('shows party list if multiple DAS parties', async () => {
    await renderComponent(parties, [booking]);
    see(mickey.name);
    see(donald.name);
    click('Select');
    await see.screen('DAS Selection');
    see(donald.name);
    see(daisy.name);

    click('Go Back');
    await see.screen('DAS Parties');
    click('Details');
    await see.screen('Your DAS Selection');
    see(mickey.name);
    see(minnie.name);
  });
});
