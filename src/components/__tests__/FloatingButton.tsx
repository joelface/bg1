import { click, render, see } from '@/testing';

import FloatingButton from '../FloatingButton';

let clicked = false;
const onClick = () => {
  clicked = true;
};
const label = 'Click Me';

describe('FloatingButton', () => {
  beforeEach(() => {
    clicked = false;
  });

  it('performs onClick action', () => {
    render(<FloatingButton onClick={onClick}>{label}</FloatingButton>);
    click(label);
    expect(clicked).toBe(true);
  });

  it('renders disabled button', () => {
    render(
      <FloatingButton disabled={true} onClick={onClick}>
        {label}
      </FloatingButton>
    );
    expect(see(label)).toBeDisabled();
  });
});
