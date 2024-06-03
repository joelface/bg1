import * as wdwData from '../data/wdw';
import { Experience, InvalidId, Park, Resort } from '../resort';

jest.spyOn(console, 'warn').mockImplementation(() => null);

const { experiences, parks } = wdwData;
for (const exp of Object.values(experiences)) {
  if (exp) delete exp.dropTimes;
}
const mk = parks[0] as Park;
const tron = experiences['411504498'] as Experience;
const tba = experiences['412021364'] as Experience;
tron.dropTimes = ['11:30', '14:00', '16:30'];
tba.dropTimes = ['12:00', '14:00', '16:00'];
experiences['8675309'] = null;

const wdw = new Resort('WDW', wdwData);

describe('Resort', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds dropTimes property to parks', () => {
    expect(mk.dropTimes).toEqual(['11:30', '12:00', '14:00', '16:00', '16:30']);
  });

  describe('experience()', () => {
    it('returns experience for given ID', () => {
      expect(wdw.experience(tron.id)).toBe(experiences[tron.id]);
    });

    it("throws InvalidId if experience doesn't exist", () => {
      expect(() => wdw.experience('0')).toThrow(InvalidId);
      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it("doesn't emit warning if null entry", () => {
      expect(() => wdw.experience('8675309')).toThrow(InvalidId);
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('park()', () => {
    it('returns park for given ID', () => {
      expect(wdw.park(mk.id)).toBe(mk);
    });

    it("throws InvalidId if park doesn't exist", () => {
      expect(() => wdw.park('0')).toThrow(InvalidId);
    });
  });

  describe('dropExperiences()', () => {
    it('returns drop experiences', () => {
      expect(wdw.dropExperiences(mk)).toEqual([tba, tron]);
      expect(wdw.dropExperiences(parks[1] as Park)).toEqual([]);
    });
  });
});
