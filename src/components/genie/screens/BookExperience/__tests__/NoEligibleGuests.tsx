import { booking, genie, wdw } from '@/__fixtures__/genie';
import { RebookingProvider } from '@/contexts/Rebooking';
import { displayTime } from '@/datetime';
import { see, setTime } from '@/testing';

import IneligibleGuestList from '../../../IneligibleGuestList';
import NoEligibleGuests from '../NoEligibleGuests';

jest.mock('../../../IneligibleGuestList');

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
  wdw.render(
    <RebookingProvider value={rebooking}>
      <NoEligibleGuests />
    </RebookingProvider>
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
      displayTime(genie.nextBookTime as string)
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
    setTime(genie.nextBookTime as string);
    renderComponent();
    see.no('Eligible at');
  });
});
