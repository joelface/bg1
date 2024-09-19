import { useState } from 'react';

import { ak, ep, hs, mk } from '@/__fixtures__/ll';
import { click, fireEvent, render, screen, see } from '@/testing';

import Select from '../Select';

const parkOptions = new Map(
  [mk, ep, hs, ak].map(p => [
    p.id,
    {
      text: p.name,
      icon: p.icon,
    },
  ])
);

function Selector({
  options,
  defaultValue,
}: {
  options: Map<string, { text: string; icon?: string }>;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      <button>Unrelated Button</button>
      <Select
        options={options}
        selected={value}
        onChange={setValue}
        title="Park"
      />
    </div>
  );
}

describe('Select', () => {
  it('only shows icon in button', async () => {
    render(<Selector options={parkOptions} defaultValue={hs.id} />);
    const btn = see(hs.name);
    expect(btn).toHaveTextContent(hs.icon);

    click(btn);
    expect(screen.getAllByRole('listitem').map(li => li.textContent)).toEqual(
      [...parkOptions.values()].map(opt => ` ${opt.icon} ${opt.text}`)
    );
    expect(
      screen
        .getAllByRole('radio')
        .map(input => (input as HTMLInputElement).checked)
    ).toEqual([false, false, true, false]);
    click(ep.name);
    expect(btn).toHaveTextContent(ep.icon);
    expect(btn).not.toHaveTextContent(ep.name);
    expect(screen.queryByTestId('shade')).not.toBeInTheDocument();

    click(btn);
    expect(
      screen
        .getAllByRole('radio')
        .map(input => (input as HTMLInputElement).checked)
    ).toEqual([false, true, false, false]);
    let shade = screen.getByTestId('shade');
    click(shade);
    expect(shade).not.toBeInTheDocument();

    click(btn);
    shade = screen.getByTestId('shade');
    fireEvent.keyDown(shade, { key: 'ArrowDown' });
    click(ak.name);
    fireEvent.keyDown(shade, { key: 'Enter' });
    expect(shade).not.toBeInTheDocument();
    see(ak.name);

    click(btn);
    shade = screen.getByTestId('shade');
    fireEvent.focus(see('Unrelated Button'));
    expect(shade).not.toBeInTheDocument();
  });

  it('shows text in button if no icon', async () => {
    render(
      <Selector
        options={
          new Map([...parkOptions].map(([k, { text }]) => [k, { text }]))
        }
        defaultValue={ak.id}
      />
    );
    const btn = see('Park');
    expect(btn).toHaveTextContent(ak.name);

    click(btn);
    click(mk.name);
    expect(btn).toHaveTextContent(mk.name);
  });
});
