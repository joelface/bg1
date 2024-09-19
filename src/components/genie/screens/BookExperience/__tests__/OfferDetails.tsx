import { offer, renderResort } from '@/__fixtures__/genie';
import { useNav } from '@/contexts/Nav';
import { click, see, setTime } from '@/testing';

import SelectReturnTime from '../../SelectReturnTime';
import OfferDetails from '../OfferDetails';

jest.mock('@/contexts/Nav');
setTime('09:00');
const onOfferChange = jest.fn();

describe('OfferDetails', () => {
  const { goTo } = useNav();

  it('renders offer details', async () => {
    renderResort(<OfferDetails offer={offer} onOfferChange={onOfferChange} />);
    see.time(offer.start.time);
    see.time(offer.end.time);
    click('Change');
    expect(goTo).toHaveBeenCalledWith(
      <SelectReturnTime offer={offer} onOfferChange={onOfferChange} />
    );
  });

  it('tells if offer has been changed', async () => {
    renderResort(
      <OfferDetails
        offer={{ ...offer, changed: true }}
        onOfferChange={onOfferChange}
      />
    );
    see('Return time has been changed');
  });
});
