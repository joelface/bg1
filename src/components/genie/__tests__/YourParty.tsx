import { h } from 'preact';

import { click, render, screen } from '@/testing';
import {
  mickey,
  pluto,
  createParty,
  minnie,
  donald,
} from '@/__fixtures__/genie';
import YourParty from '../YourParty';
import { PartyProvider } from '@/contexts/Party';

const onSubmit = jest.fn();

const renderComponent = (party = createParty()) =>
  render(
    <PartyProvider value={party}>
      <YourParty buttonText="Book" onSubmit={onSubmit} />
    </PartyProvider>
  );

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
    renderComponent(createParty({ ineligible: [] }));
    expect(screen.queryByText('Ineligible Guests')).not.toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
