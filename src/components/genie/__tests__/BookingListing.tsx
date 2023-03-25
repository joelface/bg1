import { bg, booking } from '@/__fixtures__/genie';
import { displayTime } from '@/datetime';
import { render, see, setTime } from '@/testing';

import BookingListing from '../BookingListing';

setTime('09:00');

describe('BookingListing', () => {
  it('renders listing', () => {
    render(<BookingListing booking={booking} />);
    see(booking.name);
    see(displayTime(booking.start.time as string));
    see(displayTime(booking.end.time as string));
    see.no('DAS');

  it('shows boarding group', () => {
    render(<BookingListing booking={bg} />);
    see(`BG ${bg.boardingGroup}`);
  });

  it('says "Ready to board" when boarding group called', () => {
    render(<BookingListing booking={{ ...bg, status: 'SUMMONED' }} />);
    see(`BG ${bg.boardingGroup}`);
    see('Board Now');
  });

  it('shows DAS badge', () => {
    render(<BookingListing booking={{ ...booking, subtype: 'DAS' }} />);
    see('DAS');
  });
});
