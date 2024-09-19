import { booking } from '@/__fixtures__/genie';
import { useNav } from '@/contexts/Nav';
import { RebookingContext } from '@/contexts/Rebooking';
import { click, render, see, setTime, waitFor } from '@/testing';

import RebookingHeader from '../RebookingHeader';
import Home from '../screens/Home';

jest.mock('@/contexts/Nav');
setTime('10:00');

const rebooking = {
  begin: () => null,
  end: jest.fn(),
  current: booking as typeof booking | undefined,
};

function Test() {
  return (
    <RebookingContext.Provider value={rebooking}>
      <RebookingHeader />
    </RebookingContext.Provider>
  );
}

describe('RebookingHeader', () => {
  const { goBack } = useNav();

  beforeEach(() => {
    rebooking.current = booking;
  });

  it('shows LL to be modified', async () => {
    render(<Test />);
    see(booking.name);
    see.time(booking.start.time as string);
    see.time(booking.end.time as string);
    click('Keep');
    expect(rebooking.end).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(goBack).toHaveBeenCalledTimes(1));
    expect(goBack).toHaveBeenLastCalledWith({ screen: Home });
  });

  it('shows nothing if not modifying', () => {
    rebooking.current = undefined;
    const { container } = render(<Test />);
    expect(container).toBeEmptyDOMElement();
  });
});
