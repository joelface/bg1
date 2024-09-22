import { TODAY, TOMORROW, YESTERDAY, setTime } from '@/testing';

import {
  DateTime,
  displayDate,
  displayTime,
  parkDate,
  splitDateTime,
  upcomingTimes,
} from '../datetime';

beforeEach(() => {
  setTime('08:00');
});

describe('DateTime', () => {
  it('accepts Date object', () => {
    expect(new DateTime(new Date('1998-04-22T16:35:40-0400'))).toEqual({
      date: '1998-04-22',
      time: '16:35:40',
    });
  });

  it('accepts timestamp', () => {
    expect(new DateTime(893277340000)).toEqual({
      date: '1998-04-22',
      time: '16:35:40',
    });
  });

  it('defaults to current date/time', () => {
    expect(new DateTime()).toEqual({
      date: '2021-10-01',
      time: '08:00:00',
    });
  });

  describe('DateTime.setTimeZone()', () => {
    const resetTZ = () => DateTime.setTimeZone('America/New_York');
    beforeEach(resetTZ);
    afterAll(resetTZ);

    it('sets default time zone', () => {
      DateTime.setTimeZone('America/Los_Angeles');
      expect(new DateTime(new Date(893277340752))).toEqual({
        date: '1998-04-22',
        time: '13:35:40',
      });
    });
  });
});

describe('displayDate()', () => {
  it('formats date for display', () => {
    expect(displayDate(TODAY)).toBe('Today, October 1');
    expect(displayDate(TODAY, 'short')).toBe('October 1');
    expect(displayDate(TOMORROW)).toBe('Tomorrow, October 2');
  });
});

describe('displayTime()', () => {
  it('formats time for display', () => {
    expect(displayTime('08:14:42')).toBe('8:14 AM');
    expect(displayTime('08:14')).toBe('8:14 AM');
    expect(displayTime('8:00')).toBe('8:00 AM');
  });
});

describe('parkDate()', () => {
  it(`returns today's date if after 3 AM`, () => {
    setTime('23:59:59');
    expect(parkDate()).toBe(TODAY);
    setTime('03:00:01');
    expect(parkDate()).toBe(TODAY);
  });

  it(`returns yesterday's date if it's between midnight and 3 AM`, () => {
    setTime('00:00:00');
    expect(parkDate()).toBe(YESTERDAY);
    setTime('03:00:00');
    expect(parkDate()).toBe(YESTERDAY);
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

const times = ['11:30', '14:30', '17:30'];

describe('upcomingTimes()', () => {
  it('returns upcoming times', () => {
    expect(upcomingTimes(times)).toEqual(times);
    setTime('12:00');
    expect(upcomingTimes(times)).toEqual(times.slice(1));
    setTime('15:00');
    expect(upcomingTimes(times)).toEqual(times.slice(2));
    setTime('18:00');
    expect(upcomingTimes(times)).toEqual([]);
  });
});
