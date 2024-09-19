import { booking, ll, renderResort } from '@/__fixtures__/ll';
import IneligibleGuestList from '@/components/ll/IneligibleGuestList';
import { RebookingContext } from '@/contexts/Rebooking';
import { displayTime } from '@/datetime';
import { see, setTime } from '@/testing';

import NoEligibleGuests from '../NoEligibleGuests';

jest.mock('@/components/ll/IneligibleGuestList');

function renderComponent({
  modify = false,
}: {
  modify?: boolean;
} = {}) {
  const rebooking = {
    current: modify ? booking : undefined,
    begin: jest.fn(),
    end: jest.fn(),
  };
  renderResort(
    <RebookingContext.Provider value={rebooking}>
      <NoEligibleGuests />
    </RebookingContext.Provider>
  );
}

describe('NoEligibleGuests', () => {
  beforeEach(() => {
    setTime('09:00');
  });

  it(`shows "No Eligible Guests" if not rebooking`, () => {
    renderComponent();
    see('No Eligible Guests');
    expect(see('Eligible at')).toHaveTextContent(
      displayTime(ll.nextBookTime as string)
    );
    expect(IneligibleGuestList).toHaveBeenCalled();
  });

  it(`shows "Unable to Modify" if rebooking`, () => {
    renderComponent({ modify: true });
    see('Unable to Modify');
    see.no('Eligible at');
    expect(IneligibleGuestList).toHaveBeenCalled();
  });

  it(`doesn't show "Eligible at" time if eligible now`, () => {
    setTime(ll.nextBookTime as string);
    renderComponent();
    see.no('Eligible at');
  });
});
