import { bg, booking, multiExp } from '@/__fixtures__/ll';
import { DasBooking } from '@/api/itinerary';
import { render, see, setTime } from '@/testing';

import BookingListing from '../BookingListing';

setTime('09:00');

describe('BookingListing', () => {
  it('renders listing', () => {
    render(<BookingListing booking={booking} button={<button>Info</button>} />);
    see(booking.name);
    see.time(booking.start.time as string);
    see.time(booking.end.time as string);
    see.no('DAS');
    see('Info', 'button');
  });

  it('shows multiple experiences LLs', () => {
    render(<BookingListing booking={multiExp} />);
    see('Multiple Experiences');
  });

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
    render(
      <BookingListing
        booking={
          {
            ...booking,
            type: 'DAS',
            subtype: 'IN_PARK',
            modifiable: undefined,
          } as DasBooking
        }
      />
    );
    see('DAS');
  });
});
