import { click, render } from '/testing';
import { offer } from '/__fixtures__/genie';
import OfferDetails from '../OfferDetails';

const onBook = jest.fn();

describe('OfferDetails', () => {
  it('renders offer details', () => {
    const { container } = render(
      <OfferDetails offer={offer} onBook={onBook} />
    );
    expect(container).toHaveTextContent('11:25 AM - 12:25 PM');
    click('Book Lightning Lane');
    expect(onBook).toBeCalledTimes(1);
  });
});
