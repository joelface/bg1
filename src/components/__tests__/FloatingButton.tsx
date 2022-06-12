import { click, render, screen, within } from '/testing';
import FloatingButton from '../FloatingButton';

let clicked = false;
const onClick = () => (clicked = true);
const label = 'Click Me';

describe('FloatingButton', () => {
  beforeEach(() => {
    clicked = false;
  });

  it('renders button with link', () => {
    const url = 'https://example.com/';
    render(<FloatingButton href={url}>{label}</FloatingButton>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', url);
    expect(within(link).getByRole('button')).toBeInTheDocument();
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
    expect(screen.getByText(label)).toBeDisabled();
  });
});
