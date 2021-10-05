import { h } from 'preact';
import { fireEvent, render, screen, within } from '@testing-library/preact';

import { guests, mickey, pluto } from '../../__fixtures__/vq';
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
      expect(li).toHaveTextContent(`${g.firstName} ${g.lastName}`.trimEnd());
      if (g.avatarImageUrl) {
        expect(within(li).getByRole('img')).toHaveAttribute(
          'src',
          g.avatarImageUrl
        );
      } else {
        expect(within(li).getByText(g.firstName[0])).toBeInTheDocument();
      }
    });
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders selectable guest list', () => {
    const selected = [mickey];
    render(
      <GuestList
        guests={guests}
        selectable={{
          isSelected: i => !!selected[i],
          onToggle: i => {
            selected[i] ? delete selected[i] : (selected[i] = guests[i]);
          },
        }}
      />
    );
    expect(getAllChecked()).toEqual([true, false, false, false]);

    fireEvent.click(screen.getByLabelText('Mickey Mouse'));
    expect(selected.includes(mickey)).toBe(false);

    fireEvent.click(screen.getByLabelText('Pluto'));
    expect(selected.includes(pluto)).toBe(true);

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
