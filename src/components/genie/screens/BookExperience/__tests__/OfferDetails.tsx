import { offer } from '@/__fixtures__/genie';
import { click, render, screen, setTime } from '@/testing';

import OfferDetails from '../OfferDetails';

setTime('09:00');
const onBook = jest.fn();

describe('OfferDetails', () => {
  it('renders offer details', () => {
    render(<OfferDetails offer={offer} onBook={onBook} />);
    screen.getByText('11:25 AM - 12:25 PM');
    click('Book Lightning Lane');
    expect(onBook).toBeCalledTimes(1);
  });

  it('tells if offer has been changed', async () => {
    render(
      <OfferDetails offer={{ ...offer, changed: true }} onBook={onBook} />
    );
    screen.getByText('Return time has been changed');
  });
});
