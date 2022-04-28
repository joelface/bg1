import { h } from 'preact';

import { click, render, screen, within } from '@/testing';
import { guests, mickey, pluto } from '@/__fixtures__/vq';
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

  it('renders selectable guest list', () => {
    const selected = new Set([mickey]);
    render(
      <GuestList
        guests={guests}
        selectable={{
          isSelected: g => selected.has(g),
          onToggle: g => {
            selected[selected.has(g) ? 'delete' : 'add'](g);
          },
        }}
      />
    );
    expect(getAllChecked()).toEqual([true, false, false, false]);

    click('Mickey Mouse');
    expect(selected.has(mickey)).toBe(false);

    click('Pluto');
    expect(selected.has(pluto)).toBe(true);

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
    expect(screen.getByText('Mickey Mouse')).toHaveTextContent('NO PARK PASS');
    expect(screen.getByText('Minnie Mouse')).toHaveTextContent(
      /^Minnie Mouse$/
    );
    expect(screen.getByText('Pluto')).toHaveTextContent('REDEEM LIMIT REACHED');
    expect(screen.getByText('Fifi')).toHaveTextContent(/^Fifi$/);
  });
});
