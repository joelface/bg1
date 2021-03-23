import { dateTimeStrings } from '../datetime';

describe('dateTimeStrings()', () => {
  it('parses Date object', () => {
    expect(dateTimeStrings(new Date(893277340752))).toEqual({
      date: '1998-04-22',
      time: '16:35:40.752',
    });
  });
});
