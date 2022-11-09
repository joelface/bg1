import { ClientProvider } from '@/contexts/Client';
import { click, loading, render, screen } from '@/testing';
import { client } from '@/__fixtures__/genie';
import PartySelector, {
  loadPartyIds,
  useSelectedParty,
} from '../PartySelector';

jest.useFakeTimers();
client.setPartyIds = jest.fn();
const onClose = jest.fn();

function PartyLoader() {
  useSelectedParty();
  return null;
}

describe('PartySelector', () => {
  it('renders party selection screen', async () => {
    const { eligible, ineligible } = await client.guests();
    const guests = [...eligible, ...ineligible];
    render(
      <ClientProvider value={client}>
        <PartySelector onClose={onClose} />
        <PartyLoader />
      </ClientProvider>
    );
    expect(client.setPartyIds).lastCalledWith([]);
    expect(
      screen.getByRole('radio', { name: 'Book for all eligible guests' })
    ).toBeChecked();
    expect(
      screen.getByRole('radio', { name: 'Only book for selected guests' })
    ).not.toBeChecked();

    click('Only book for selected guests');
    await loading();
    screen.getByText('Add to Your Party');
    expect(screen.queryByText('Your Party')).not.toBeInTheDocument();

    guests.forEach(g => click(g.name));
    screen.getByText('Your Party');
    expect(screen.queryByText('Add to Your Party')).not.toBeInTheDocument();

    click('Save');
    const guestIds = guests.map(g => g.id);
    expect(client.setPartyIds).lastCalledWith(guestIds);
    expect(loadPartyIds()).toEqual(guestIds);

    click('Book for all eligible guests');
    click('Save');
    expect(client.setPartyIds).lastCalledWith([]);
    expect(loadPartyIds()).toEqual([]);

    click('Cancel');
    expect(client.setPartyIds).toBeCalledTimes(3);
    expect(onClose).toBeCalledTimes(3);
  });
});
