import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';

import { guests } from '../../__fixtures__/vq';
import GuestList from '../GuestList';
import BGResult from '../BGResult';

jest.mock('../GuestList');
const GuestListMock = GuestList as jest.MockedFunction<typeof GuestList>;

const onDone = jest.fn();

describe('BGResult', () => {
  beforeEach(() => {
    GuestListMock.mockClear();
  });

  it('shows boarding group obtained', () => {
    const conflicts = {
      pluto: 'NOT_IN_PARK' as const,
      fifi: 'NOT_IN_PARK' as const,
    };
    const { container } = render(
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
    expect(container).toHaveTextContent('Boarding Group: 89');
    fireEvent.click(screen.getByText('Done'));
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

  it('show failure message', () => {
    render(
      <BGResult
        guests={guests}
        result={{ boardingGroup: null, conflicts: {}, closed: true }}
        onDone={onDone}
      />
    );
    expect(screen.getByText('Sorry!')).toBeInTheDocument();
    expect(GuestListMock).lastCalledWith({ guests: [], conflicts: {} }, {});
  });
});
