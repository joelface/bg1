import { TODAY, YESTERDAY, setTime } from '@/testing';

import {
  dateTimeStrings,
  displayTime,
  parkDate,
  setDefaultTimeZone,
  splitDateTime,
} from '../datetime';

beforeEach(() => {
  setTime('08:00');
});

describe('dateTimeStrings()', () => {
  it('parses Date object', () => {
    expect(dateTimeStrings(new Date('1998-04-22T16:35:40-0400'))).toEqual({
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
