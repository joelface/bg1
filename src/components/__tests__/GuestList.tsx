import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';

import { guests, mickey, pluto } from '../../__fixtures__/vq';
import GuestList from '../GuestList';

const { getAllByRole, queryByRole, getByLabelText } = screen;

function getAllChecked() {
  return getAllByRole('checkbox').map(cb => (cb as HTMLInputElement).checked);
}

describe('GuestList', () => {
  it('renders plain guest list', () => {
    render(<GuestList guests={guests} />);
    const lis = getAllByRole('listitem');
    expect(lis.map(li => li.textContent)).toEqual(
      guests.map(g => `${g.firstName} ${g.lastName}`)
    );
    expect(lis.map(li => li.querySelector('img')?.src)).toEqual(
      guests.map(g => g.avatarImageUrl)
    );
    expect(queryByRole('checkbox')).toBeNull();
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
    expect(getAllChecked()).toEqual([true, false, false]);

    fireEvent.click(getByLabelText('Mickey Mouse'));
    expect(selected.includes(mickey)).toBe(false);

    fireEvent.click(getByLabelText('Pluto'));
    expect(selected.includes(pluto)).toBe(true);
    expect(getAllChecked()).toEqual([false, false, true]);
  });
});
