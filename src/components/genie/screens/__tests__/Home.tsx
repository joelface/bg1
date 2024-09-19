import {
  booking,
  das,
  hs,
  liveData,
  mk,
  renderResort,
} from '@/__fixtures__/genie';
import kvdb from '@/kvdb';
import { click, loading, revisitTab, see, setTime } from '@/testing';

import Merlock from '../../Merlock';
import { TAB_KEY, getDefaultTab } from '../Home';

jest.mock('@/ping');
jest.spyOn(das, 'parties').mockResolvedValue([]);
jest.spyOn(liveData, 'shows').mockResolvedValue({});

beforeEach(() => {
  kvdb.clear();
});

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setTime('10:00');
  });

  it('shows LL home screen', async () => {
    renderResort(<Merlock />);
    await loading();

    revisitTab(60);
    await loading();

    click('Times');
    expect(kvdb.get(TAB_KEY)).toBe('Times');

    click(mk.name);
    click(hs.name, 'radio');
    await loading();
    see(hs.name);

    click('Plans');
    click(booking.name);
    jest.spyOn(Element.prototype, 'scroll');
    await see.screen('Your Lightning Lane');
    click('Modify');
    await see.screen('LL');
    expect(see(mk.name)).toBeEnabled();
    expect(Element.prototype.scroll).toHaveBeenCalledTimes(2);
  });
});

describe('getDefaultTab()', () => {
  it('returns default tab', () => {
    expect(getDefaultTab()).toBe('LL');
    kvdb.set(TAB_KEY, 'Times');
    expect(getDefaultTab()).toBe('Times');
  });
});
