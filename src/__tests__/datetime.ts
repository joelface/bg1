import {
  dateTimeStrings,
  displayTime,
  returnTime,
  setDefaultTimeZone,
  splitDateTime,
} from '../datetime';

// 2021-10-01 08:00:00 EDT
Date.now = jest
  .spyOn(Date, 'now')
  .mockImplementation(() => 1633089600000) as unknown as () => number;

describe('dateTimeStrings()', () => {
  it('parses Date object', () => {
    expect(dateTimeStrings(new Date(893277340752))).toEqual({
      date: '1998-04-22',
      time: '16:35:40',
    });
  });

  it('returns current datetime with no argument', () => {
    expect(dateTimeStrings()).toEqual({
      date: '2021-10-01',
      time: '08:00:00',
    });
  });
});

describe('displayTime()', () => {
  it('formats time for display', () => {
    expect(displayTime('08:14:42')).toBe('8:14 AM');
    expect(displayTime('08:14')).toBe('8:14 AM');
    expect(displayTime('8:00')).toBe('8:00 AM');
  });
});

describe('splitDateTime()', () => {
  it('splits date/time string', () => {
    expect(splitDateTime('1998-04-22T16:35:40.123')).toEqual({
      date: '1998-04-22',
      time: '16:35:40',
    });
  });
});

describe('setDefaultTimeZone()', () => {
  beforeEach(() => {
    setDefaultTimeZone('America/New_York');
  });

  it('sets default time zone', () => {
    setDefaultTimeZone('America/Los_Angeles');
    expect(dateTimeStrings(new Date(893277340752))).toEqual({
      date: '1998-04-22',
      time: '13:35:40',
    });
  });
});

describe('returnTime()', () => {
  it('returns return window string', () => {
    expect(
      returnTime({
        start: { date: '2021-10-01', time: '11:35:00' },
        end: { date: '2021-10-01', time: '12:35:00' },
      })
    ).toBe('11:35 AM - 12:35 PM');

    expect(
      returnTime({
        start: { date: '2021-09-30', time: '11:35:00' },
        end: { date: '2021-10-02' },
      })
    ).toBe('Sep 30 - Oct 2');

    expect(
      returnTime({
        start: { date: '2021-10-01' },
        end: { date: '2021-10-01' },
      })
    ).toBe('Park Open - Park Close');

    expect(
      returnTime({
        start: { date: '2021-10-01', time: '12:00' },
        end: { date: '2021-10-01' },
      })
    ).toBe('12:00 PM - Park Close');

    expect(
      returnTime({
        start: { date: '2021-10-01', time: '12:00' },
        end: { date: '2021-10-02' },
      })
    ).toBe('12:00 PM - Oct 2');
  });
});
