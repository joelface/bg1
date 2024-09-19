import { booking, ll, modOffer, renderResort, wdw } from '@/__fixtures__/genie';
import { useNav } from '@/contexts/Nav';
import { PlansContext } from '@/contexts/Plans';
import { ping } from '@/ping';
import { TODAY, act, click, loading, see } from '@/testing';

import BookNewReturnTime from '../BookNewReturnTime';
import BookingDetails from '../BookingDetails';
import Home from '../Home';
import SelectReturnTime from '../SelectReturnTime';

jest.mock('@/contexts/Nav');
jest.mock('@/ping');
jest.useFakeTimers();
const refreshPlans = jest.fn();

async function renderComponent() {
  return renderResort(
    <PlansContext.Provider
      value={{ plans: [], refreshPlans, loaderElem: null }}
    >
      <BookNewReturnTime offer={modOffer} />
    </PlansContext.Provider>
  );
}

describe('BookNewReturnTime', () => {
  const { goTo, goBack } = useNav();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('books new return time', async () => {
    renderComponent();
    see(modOffer.experience.name, 'heading');
    see.time(modOffer.start.time);
    see.time(modOffer.end.time);

    click('Change');
    expect(goTo).toHaveBeenCalledWith(
      <SelectReturnTime offer={modOffer} onOfferChange={expect.any(Function)} />
    );
    const { onOfferChange } = jest.mocked(goTo).mock.lastCall?.[0].props ?? {};
    expect(onOfferChange).toBeInstanceOf(Function);

    const newOffer = {
      ...modOffer,
      start: { date: TODAY, time: '12:25:00' },
      end: { date: TODAY, time: '13:25:00' },
    };
    act(() => onOfferChange(newOffer));

    click('Modify Lightning Lane');
    await loading();
    expect(ll.book).toHaveBeenCalledWith(newOffer);
    expect(refreshPlans).toHaveBeenCalledTimes(1);
    expect(goBack).toHaveBeenCalledWith({ screen: Home });
    expect(goTo).toHaveBeenCalledWith(
      <BookingDetails booking={booking} isNew />
    );
    expect(ping).toHaveBeenCalledWith(wdw, 'G');
  });
});
