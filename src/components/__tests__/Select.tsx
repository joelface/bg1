import { useState } from 'react';

import { mk, ep, hs, ak } from '@/__fixtures__/genie';
import { click, render, screen } from '@/testing';

import Select, { Option } from '../Select';

const options = [mk, ep, hs, ak].map(p => ({
  value: p.id,
  text: p.name,
  icon: p.icon,
}));

function Selector({
  options,
  defaultValue,
}: {
  options: Option[];
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <Select options={options} value={value} onChange={setValue} title="Park" />
  );
}

describe('Select', () => {
  it('only shows icon in button', async () => {
    render(<Selector options={options} defaultValue={hs.id} />);
    const btn = screen.getByTitle('Park');
    expect(btn).toHaveTextContent(hs.icon);

    click(btn);
    expect(screen.getAllByRole('listitem').map(li => li.textContent)).toEqual(
      options.map(opt => ` ${opt.icon} ${opt.text}`)
    );
    expect(
      screen
        .getAllByRole('radio')
        .map(input => (input as HTMLInputElement).checked)
    ).toEqual([false, false, true, false]);
    click(ep.name);
    expect(btn).toHaveTextContent(ep.icon);
    expect(btn).not.toHaveTextContent(ep.name);
    expect(screen.queryByTestId('select-shade')).not.toBeInTheDocument();

    click(btn);
    expect(
      screen
        .getAllByRole('radio')
        .map(input => (input as HTMLInputElement).checked)
    ).toEqual([false, true, false, false]);
    const shade = screen.getByTestId('select-shade');
    click(shade);
    expect(shade).not.toBeInTheDocument();
  });

  it('shows text in button if no icon', async () => {
    render(
      <Selector
        options={options.map(opt => ({ value: opt.value, text: opt.text }))}
        defaultValue={ak.id}
      />
    );
    const btn = screen.getByTitle('Park');
    expect(btn).toHaveTextContent(ak.name);

    click(btn);
    click(mk.name);
    expect(btn).toHaveTextContent(mk.name);
  });
});
