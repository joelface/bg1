import { dateTimeStrings, setDefaultTimeZone } from '../datetime';

describe('dateTimeStrings()', () => {
  it('parses Date object', () => {
    expect(dateTimeStrings(new Date(893277340752))).toEqual({
      date: '1998-04-22',
      time: '16:35:40.752',
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
      time: '13:35:40.752',
    });
  });
});
