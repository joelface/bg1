import { click, render, screen } from '/testing';
import Prebooking from '../Prebooking';

jest.useFakeTimers();

const onRefresh = jest.fn();

describe('Prebooking', () => {
  beforeEach(() => {
    onRefresh.mockClear();
  });

  it('shows prebooking info with start time', () => {
    render(<Prebooking startTime={'07:00:00'} onRefresh={onRefresh} />);
    screen.getByText('Booking start:');
    screen.getByText('7:00 AM');
    click('Check Availability');
    expect(onRefresh).toBeCalledTimes(1);
  });

  it('shows prebooking info without start time', () => {
    render(<Prebooking onRefresh={onRefresh} />);
    expect(screen.queryByText('Booking start:')).not.toBeInTheDocument();
    click('Check Availability');
    expect(onRefresh).toBeCalledTimes(1);
  });
});
