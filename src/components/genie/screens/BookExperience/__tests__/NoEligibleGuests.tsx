import { booking, client } from '@/__fixtures__/genie';
import { GenieClientProvider } from '@/contexts/GenieClient';
import { RebookingProvider } from '@/contexts/Rebooking';
import { displayTime } from '@/datetime';
import { render, see, setTime } from '@/testing';

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
  render(
    <GenieClientProvider value={client}>
      <RebookingProvider value={rebooking}>
        <NoEligibleGuests />
      </RebookingProvider>
    </GenieClientProvider>
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
      displayTime(client.nextBookTime as string)
    );
    expect(IneligibleGuestList).toBeCalled();
  });

  it(`shows "Unable to Modify" if rebooking`, () => {
    renderComponent({ modify: true });
    see('Unable to Modify');
    see.no('Eligible at');
    expect(IneligibleGuestList).toBeCalled();
  });

  it(`doesn't show "Eligible at" time if eligible now`, () => {
    setTime(client.nextBookTime as string);
    renderComponent();
    see.no('Eligible at');
  });
});
