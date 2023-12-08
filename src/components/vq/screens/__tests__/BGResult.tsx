import { guests, rotr } from '@/__fixtures__/vq';
import { JoinQueueResult } from '@/api/vq';
import GuestList from '@/components/GuestList';
import { render, see } from '@/testing';

import BGResult from '../BGResult';

jest.useFakeTimers();
jest.mock('@/components/GuestList');

function renderComponent(result: JoinQueueResult) {
  render(<BGResult queue={rotr} guests={guests} result={result} />);
}

describe('BGResult', () => {
  beforeEach(async () => {
    jest.mocked(GuestList).mockClear();
  });

  it('shows boarding group obtained', async () => {
    const conflicts = {
      pluto: 'NOT_IN_PARK' as const,
      fifi: 'NOT_IN_PARK' as const,
    };

    renderComponent({
      boardingGroup: 89,
      conflicts,
      closed: false,
    });
    see('Boarding Group: 89');

    expect(GuestList).nthCalledWith(
      1,
      {
        guests: guests.slice(0, 2),
      },
      {}
    );
    expect(GuestList).nthCalledWith(
      2,
      {
        guests: guests.slice(2),
        conflicts,
      },
      {}
    );
  });

  it('show failure message', async () => {
    renderComponent({ boardingGroup: null, conflicts: {}, closed: true });
    see('Sorry!');
    expect(GuestList).lastCalledWith({ guests: [], conflicts: {} }, {});
  });
});
