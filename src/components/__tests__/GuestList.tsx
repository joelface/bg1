import { useState } from 'react';

import { click, render, screen, within } from '/testing';
import { guests, mickey, minnie, pluto, fifi } from '/__fixtures__/vq';
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
    screen.getAllByRole('listitem').forEach((li, i) => {
      const g = guests[i];
      expect(li).toHaveTextContent(g.name);
      if (g.avatarImageUrl) {
        expect(within(li).getByRole('img')).toHaveAttribute(
          'src',
          g.avatarImageUrl
        );
      } else {
        expect(within(li).getByText(g.name[0])).toBeInTheDocument();
      }
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
    expect(screen.getByText(mickey.name)).toHaveTextContent('NO PARK PASS');
    expect(screen.getByText(minnie.name)).toHaveTextContent(/^Minnie Mouse$/);
    expect(screen.getByText(pluto.name)).toHaveTextContent(
      'REDEEM LIMIT REACHED'
    );
    expect(screen.getByText(fifi.name)).toHaveTextContent(/^Fifi$/);
  });
});
