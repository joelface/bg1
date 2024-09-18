import { booking, genie, mickey, minnie, party, wdw } from '@/__fixtures__/das';
import { DasBooking, DasParty } from '@/api/das';
import { Nav } from '@/contexts/Nav';
import { PlansProvider, usePlansState } from '@/contexts/Plans';
import { click, loading, see, setTime } from '@/testing';

import DasPartyList from '../DasPartyList';

setTime('10:00');

const donald = {
  id: 'donald',
  name: 'Donald Duck',
};

const daisy = {
  id: 'daisy',
  name: 'Daisy Duck',
};

const parties: DasParty[] = [
  party,
  { primaryGuest: daisy, linkedGuests: [donald], selectionLimit: 4 },
];

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
  jest
    .spyOn(genie, 'bookings')
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce(plans);
  wdw.render(<DasPartyListTest parties={parties} />);
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
    see(daisy.name);
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
