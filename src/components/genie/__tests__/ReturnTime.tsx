import { TODAY, TOMORROW, YESTERDAY, render, see, setTime } from '@/testing';
import ReturnTime from '../ReturnTime';

setTime('09:00');

describe('ReturnTime', () => {
  it('shows return time details', () => {
    const { container } = render(
      <ReturnTime
        start={{ date: TODAY, time: '10:00:00' }}
        end={{ date: TODAY, time: '11:00:00' }}
      />
    );
    expect(container).toHaveTextContent('Arrive by:10:00 AM – 11:00 AM');
    see.no('Valid until:');
  });

  it('shows return time that is valid until the next day', () => {
    const { container } = render(
      <ReturnTime
        start={{ date: TODAY, time: '10:00:00' }}
        end={{ date: TOMORROW, time: '11:00:00' }}
      />
    );
    expect(container).toHaveTextContent('Arrive by:10:00 AM – Park Close');
    expect(container).toHaveTextContent('Valid until:Tomorrow, October 2');
  });

  it('shows return time from park open to close', () => {
    const { container } = render(
      <ReturnTime
        start={{ date: YESTERDAY, time: '10:00:00' }}
        end={{ date: TODAY }}
      />
    );
    expect(container).toHaveTextContent('Arrive by:Park Open – Park Close');
    see.no('Valid until:');
  });
});
