import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';

import { guests } from '../../__fixtures__/vq';
import GuestList from '../GuestList';
import BGResult from '../BGResult';

jest.mock('../GuestList');
const GuestListMock = GuestList as jest.MockedFunction<typeof GuestList>;

const { getByRole } = screen;

const onDone = jest.fn();

describe('BGResult', () => {
  beforeEach(() => {
    GuestListMock.mockClear();
  });

  it('shows boarding group obtained', () => {
    const { container } = render(
      <BGResult
        guests={guests}
        result={{
          boardingGroup: 89,
          conflicts: { pluto: 'NOT_IN_PARK' },
          closed: false,
        }}
        onDone={onDone}
      />
    );
    expect(container).toHaveTextContent('Boarding Group: 89');
    fireEvent.click(getByRole('button'));
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
        conflicts: { pluto: 'NOT_IN_PARK' },
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
    expect(getByRole('heading', { level: 2 })).toHaveTextContent('Sorry!');
    expect(GuestListMock).lastCalledWith({ guests: [], conflicts: {} }, {});
  });
});
