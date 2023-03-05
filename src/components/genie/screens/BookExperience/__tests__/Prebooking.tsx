import { click, render, see } from '@/testing';

import Prebooking from '../Prebooking';

jest.useFakeTimers();

const onRefresh = jest.fn();

describe('Prebooking', () => {
  beforeEach(() => {
    onRefresh.mockClear();
  });

  it('shows prebooking info with start time', () => {
    render(<Prebooking startTime={'07:00:00'} onRefresh={onRefresh} />);
    see('Booking start:');
    see('7:00 AM');
    click('Check Availability');
    expect(onRefresh).toBeCalledTimes(1);
  });

  it('shows prebooking info without start time', () => {
    render(<Prebooking onRefresh={onRefresh} />);
    see.no('Booking start:');
    click('Check Availability');
    expect(onRefresh).toBeCalledTimes(1);
  });
});
