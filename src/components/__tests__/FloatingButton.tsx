import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';

import FloatingButton from '../FloatingButton';

const { getByRole } = screen;

let clicked = false;
const onClick = () => (clicked = true);
const label = 'Click Me';

describe('FloatingButton', () => {
  beforeEach(() => {
    clicked = false;
  });

  it('renders button with link', () => {
    const url = 'https://example.com/';
    const { getByRole } = render(
      <FloatingButton href={url}>{label}</FloatingButton>
    );
    const link = getByRole('link');
    expect(link).toHaveTextContent(label);
    expect(link).toHaveAttribute('href', url);
  });

  it('performs onClick action', () => {
    render(<FloatingButton onClick={onClick}>{label}</FloatingButton>);
    fireEvent.click(getByRole('button'));
    expect(clicked).toBe(true);
  });

  it('renders disabled button', () => {
    render(
      <FloatingButton disabled={true} onClick={onClick}>
        {label}
      </FloatingButton>
    );
    expect(getByRole('button')).toBeDisabled();
  });
});
