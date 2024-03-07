import { offer } from '@/__fixtures__/genie';
import { displayTime } from '@/datetime';
import { click, render, see, setTime } from '@/testing';

import OfferDetails from '../OfferDetails';

setTime('09:00');
const onBook = jest.fn();

describe('OfferDetails', () => {
  it('renders offer details', () => {
    render(<OfferDetails offer={offer} onBook={onBook} />);
    see(displayTime(offer.start.time));
    see(displayTime(offer.end.time));
    click('Book Lightning Lane');
    expect(onBook).toHaveBeenCalledTimes(1);
  });

  it('tells if offer has been changed', async () => {
    render(
      <OfferDetails offer={{ ...offer, changed: true }} onBook={onBook} />
    );
    see('Return time has been changed');
  });
});
