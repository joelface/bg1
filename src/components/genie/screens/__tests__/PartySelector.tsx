import { genie, wdw } from '@/__fixtures__/genie';
import { useNav } from '@/contexts/Nav';
import kvdb from '@/kvdb';
import { click, loading, see, waitFor } from '@/testing';

import PartySelector, {
  PARTY_IDS_KEY,
  loadPartyIds,
  useSelectedParty,
} from '../PartySelector';

jest.mock('@/contexts/Nav');
jest.useFakeTimers();
jest.spyOn(genie, 'setPartyIds');

function PartySelectorTest() {
  useSelectedParty();
  return <PartySelector />;
}

async function renderComponent() {
  wdw.render(<PartySelectorTest />);
  await loading();
}

describe('PartySelector', () => {
  const { goBack } = useNav();

  beforeEach(() => {
    jest.clearAllMocks();
    kvdb.clear();
  });

  it('renders party selection screen', async () => {
    const { eligible, ineligible } = await genie.guests();
    const guests = [...eligible, ...ineligible];
    await renderComponent();
    expect(see('Book for all eligible guests', 'radio')).toBeChecked();
    expect(see('Only book for selected guests', 'radio')).not.toBeChecked();
    expect(genie.setPartyIds).toHaveBeenLastCalledWith([]);

    click('Only book for selected guests');
    see('Add to Your Party');
    see.no('Your Party');

    guests.forEach(g => click(g.name));
    see('Your Party');
    see.no('Add to Your Party');
    click(guests[0].name);
    see('Add to Your Party');

    click('Save');
    await waitFor(() => expect(goBack).toHaveBeenCalled());
    const guestIds = guests.slice(1).map(g => g.id);
    expect(genie.setPartyIds).toHaveBeenLastCalledWith(guestIds);
    expect(loadPartyIds()).toEqual(guestIds);

    click('Book for all eligible guests');
    click('Save');
    expect(genie.setPartyIds).toHaveBeenLastCalledWith([]);
    expect(loadPartyIds()).toEqual([]);
  });

  it('shows "No guests to select" if no guests loaded', async () => {
    genie.guests.mockResolvedValueOnce({ eligible: [], ineligible: [] });
    await renderComponent();
    click('Only book for selected guests');
    see('No guests to select');
  });

  it('loads party IDs from localStorage', async () => {
    const guestIds = (await genie.guests()).eligible.map(g => g.id);
    kvdb.set(PARTY_IDS_KEY, guestIds);
    await renderComponent();
    expect(genie.setPartyIds).toHaveBeenLastCalledWith(guestIds);
  });

  it('ignores non-array values in localStorage', async () => {
    kvdb.set(PARTY_IDS_KEY, {});
    await renderComponent();
    expect(genie.setPartyIds).toHaveBeenLastCalledWith([]);
  });
});
