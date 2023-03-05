import { client } from '@/__fixtures__/genie';
import { useNav } from '@/contexts/Nav';
import { click, loading, render, see, waitFor } from '@/testing';

import PartySelector, {
  PARTY_IDS_KEY,
  loadPartyIds,
  useSelectedParty,
} from '../PartySelector';

jest.mock('@/contexts/GenieClient');
jest.mock('@/contexts/Nav');
jest.useFakeTimers();

function PartySelectorTest() {
  useSelectedParty();
  return <PartySelector />;
}

async function renderComponent() {
  render(<PartySelectorTest />);
  await loading();
}

describe('PartySelector', () => {
  const { goBack } = useNav();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders party selection screen', async () => {
    const { eligible, ineligible } = await client.guests();
    const guests = [...eligible, ...ineligible];
    await renderComponent();
    expect(see('Book for all eligible guests', 'radio')).toBeChecked();
    expect(see('Only book for selected guests', 'radio')).not.toBeChecked();
    expect(client.setPartyIds).lastCalledWith([]);

    click('Only book for selected guests');
    see('Add to Your Party');
    see.no('Your Party');

    guests.forEach(g => click(g.name));
    see('Your Party');
    see.no('Add to Your Party');
    click(guests[0].name);
    see('Add to Your Party');

    click('Save');
    await waitFor(() => expect(goBack).toBeCalled());
    const guestIds = guests.slice(1).map(g => g.id);
    expect(client.setPartyIds).lastCalledWith(guestIds);
    expect(loadPartyIds()).toEqual(guestIds);

    click('Book for all eligible guests');
    click('Save');
    expect(client.setPartyIds).lastCalledWith([]);
    expect(loadPartyIds()).toEqual([]);
  });

  it('shows "No guests to select" if no guests loaded', async () => {
    client.guests.mockResolvedValueOnce({ eligible: [], ineligible: [] });
    await renderComponent();
    click('Only book for selected guests');
    see('No guests to select');
  });

  it('loads party IDs from localStorage', async () => {
    const guestIds = (await client.guests()).eligible.map(g => g.id);
    localStorage.setItem(PARTY_IDS_KEY, JSON.stringify(guestIds));
    await renderComponent();
    expect(client.setPartyIds).lastCalledWith(guestIds);
  });

  it('ignores non-array values in localStorage', async () => {
    localStorage.setItem(PARTY_IDS_KEY, '{}');
    await renderComponent();
    expect(client.setPartyIds).lastCalledWith([]);
  });
});
