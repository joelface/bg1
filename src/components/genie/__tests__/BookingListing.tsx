import { booking } from '@/__fixtures__/genie';
import { returnTime } from '@/datetime';
import { render, screen } from '@/testing';

import BookingListing from '../BookingListing';

describe('BookingListing', () => {
  it('renders listing', () => {
    render(<BookingListing booking={booking} />);
    expect(screen.getByText(booking.name)).toBeInTheDocument();
    expect(screen.getByText(returnTime(booking))).toBeInTheDocument();
    expect(screen.queryByText('DAS')).not.toBeInTheDocument();
  });

  it('shows DAS badge', () => {
    render(<BookingListing booking={{ ...booking, subtype: 'DAS' }} />);
    expect(screen.getByText('DAS')).toBeInTheDocument();
  });
});
