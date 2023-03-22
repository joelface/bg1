import { booking } from '@/__fixtures__/genie';
import { useNav } from '@/contexts/Nav';
import { RebookingProvider } from '@/contexts/Rebooking';
import { displayTime } from '@/datetime';
import { click, render, see, setTime } from '@/testing';

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
    <RebookingProvider value={rebooking}>
      <RebookingHeader />
    </RebookingProvider>
  );
}

describe('RebookingHeader', () => {
  const { goBack } = useNav();

  beforeEach(() => {
    rebooking.current = booking;
  });

  it('shows LL to be modified', () => {
    render(<Test />);
    see(booking.name);
    see(displayTime(booking.start.time as string));
    see(displayTime(booking.end.time as string));
    click('Keep');
    expect(rebooking.end).toBeCalledTimes(1);
    expect(goBack).toBeCalledTimes(1);
    expect(goBack).lastCalledWith({
      screen: Home,
      props: { tabName: 'Genie+' },
    });
  });

  it('shows nothing if not modifying', () => {
    rebooking.current = undefined;
    const { container } = render(<Test />);
    expect(container).toBeEmptyDOMElement();
  });
});
