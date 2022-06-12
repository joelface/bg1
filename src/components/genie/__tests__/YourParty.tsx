import { useState } from 'react';

import { ClientProvider } from '/contexts/Client';
import { Party, PartyProvider } from '/contexts/Party';
import { click, render, screen } from '/testing';
import { client, mickey, pluto, minnie, donald } from '/__fixtures__/genie';
import YourParty from '../YourParty';

const onSubmit = jest.fn();

function App({ party: partyOverrides }: { party: Partial<Party> }) {
  const [party, setParty] = useState<Party>({
    eligible: [mickey, minnie, pluto],
    ineligible: [donald],
    selected: [mickey, minnie],
    setSelected: selected => {
      setParty({ ...party, selected });
    },
    ...partyOverrides,
  });
  return (
    <ClientProvider value={client}>
      <PartyProvider value={party}>
        <YourParty buttonText="Book" onSubmit={onSubmit} />
      </PartyProvider>
    </ClientProvider>
  );
}

const renderComponent = (party: Partial<Party> = {}) =>
  render(<App party={party} />);

describe('YourParty', () => {
  it('shows and updates your party', async () => {
    renderComponent();
    click('Edit');
    screen.getByText('Choose Your Party');
    screen.getByText('Ineligible Guests');
    expect(screen.getByText(donald.name)).toHaveTextContent(
      'INVALID PARK ADMISSION'
    );

    click(mickey.name);
    click(minnie.name);
    const confirmBtn = screen.getByText('Confirm Party');
    expect(confirmBtn).toBeDisabled();

    click(mickey.name);
    click(pluto.name);
    expect(confirmBtn).toBeEnabled();

    click('Confirm Party');
    screen.getByText('Your Party');
    screen.getByText(mickey.name);
    screen.getByText(pluto.name);
    expect(screen.queryByText(minnie.name)).not.toBeInTheDocument();

    click('Book');
    expect(onSubmit).toBeCalledTimes(1);
  });

  it("doesn't show ineligible guest list if there are none", async () => {
    renderComponent({ ineligible: [] });
    expect(screen.queryByText('Ineligible Guests')).not.toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('limits party size', async () => {
    const { maxPartySize } = client;
    const eligible = [...Array(maxPartySize + 1).keys()]
      .map(String)
      .map(id => ({ id, name: 'G' + id }));
    const firstGuest = 'G0';
    const lastGuest = 'G' + maxPartySize;
    renderComponent({
      eligible,
      ineligible: [],
      selected: eligible.slice(0, maxPartySize),
    });
    expect(screen.getAllByRole('listitem')).toHaveLength(maxPartySize);
    screen.getByText('Party size restricted');
    click('Edit');
    click(lastGuest);
    screen.getByText('Maximum party size: ' + maxPartySize);
    click(firstGuest);
    click(lastGuest);
    click('Confirm Party');
    expect(screen.getAllByRole('listitem')).toHaveLength(maxPartySize);
    screen.getByText(lastGuest);
    expect(screen.queryByText(firstGuest)).not.toBeInTheDocument();
  });
});
