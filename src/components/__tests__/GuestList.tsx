import { useState } from 'react';

import { fifi, guests, mickey, minnie, pluto } from '@/__fixtures__/vq';
import { click, render, screen, see, within } from '@/testing';

import GuestList from '../GuestList';

function getAllChecked() {
  return screen
    .getAllByRole('checkbox')
    .map(cb => (cb as HTMLInputElement).checked);
}

describe('GuestList', () => {
  it('renders empty guest list', () => {
    const { container } = render(<GuestList guests={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders plain guest list', () => {
    render(<GuestList guests={guests} />);
    const guestLIs = screen.getAllByRole('listitem');
    guests
      .filter(g => g.avatarImageUrl !== '')
      .forEach((g, i) => {
        const li = guestLIs[i];
        expect(li).toHaveTextContent(g.name);
        expect(within(li).getByRole('presentation')).toHaveAttribute(
          'src',
          g.avatarImageUrl
        );
      });
    guests
      .filter(g => g.avatarImageUrl === '')
      .forEach((g, i) => {
        const li = guestLIs[i];
        expect(li).toHaveTextContent(g.name);
        within(li).getByText(g.name[0]);
      });
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders selectable guest list', async () => {
    function Party() {
      const [party, setParty] = useState(new Set([mickey]));
      return (
        <GuestList
          guests={guests}
          selectable={{
            isSelected: g => party.has(g),
            onToggle: g => {
              party[party.has(g) ? 'delete' : 'add'](g);
              setParty(new Set([...party]));
            },
          }}
        />
      );
    }
    render(<Party />);
    expect(getAllChecked()).toEqual([true, false, false, false]);

    click(mickey.name);
    click(pluto.name);
    expect(getAllChecked()).toEqual([false, false, false, true]);
  });

  it('renders guest list with conflicts', () => {
    render(
      <GuestList
        guests={guests}
        conflicts={{
          mickey: 'NO_PARK_PASS',
          pluto: 'REDEEM_LIMIT_REACHED',
        }}
      />
    );
    expect(see(mickey.name)).toHaveTextContent('NO PARK PASS');
    expect(see(minnie.name)).toHaveTextContent(/^Minnie Mouse$/);
    expect(see(pluto.name)).toHaveTextContent('REDEEM LIMIT REACHED');
    expect(see(fifi.name)).toHaveTextContent(/^Fifi$/);
  });
});
