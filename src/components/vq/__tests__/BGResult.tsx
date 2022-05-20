import { h } from 'preact';
import FakeTimers from '@sinonjs/fake-timers';

import { click, render, screen } from '@/testing';
import { guests } from '@/__fixtures__/vq';
import GuestList from '../../GuestList';
import BGResult from '../BGResult';

jest.mock('../../GuestList');
const GuestListMock = GuestList as jest.MockedFunction<typeof GuestList>;

const onDone = jest.fn();

describe('BGResult', () => {
  const clock = FakeTimers.install();

  beforeEach(async () => {
    GuestListMock.mockClear();
    await clock.runToLastAsync();
  });

  it('shows boarding group obtained', async () => {
    const conflicts = {
      pluto: 'NOT_IN_PARK' as const,
      fifi: 'NOT_IN_PARK' as const,
    };
    render(
      <BGResult
        guests={guests}
        result={{
          boardingGroup: 89,
          conflicts,
          closed: false,
        }}
        onDone={onDone}
      />
    );
    screen.getByText('Boarding Group: 89');

    expect(screen.queryByText('Done')).not.toBeInTheDocument();
    await clock.tickAsync(5000);
    click('Done');
    expect(onDone).toBeCalledTimes(1);

    expect(GuestListMock).nthCalledWith(
      1,
      {
        guests: guests.slice(0, 2),
      },
      {}
    );
    expect(GuestListMock).nthCalledWith(
      2,
      {
        guests: guests.slice(2),
        conflicts,
      },
      {}
    );
  });

  it('show failure message', async () => {
    render(
      <BGResult
        guests={guests}
        result={{ boardingGroup: null, conflicts: {}, closed: true }}
        onDone={onDone}
      />
    );
    expect(screen.getByText('Sorry!')).toBeInTheDocument();
    expect(GuestListMock).lastCalledWith({ guests: [], conflicts: {} }, {});

    expect(screen.queryByText('Done')).not.toBeInTheDocument();
    await clock.tickAsync(1000);
    expect(screen.getByText('Done')).toBeEnabled();
  });
});
