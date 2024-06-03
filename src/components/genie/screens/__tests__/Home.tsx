import { booking, hs, mk, wdw } from '@/__fixtures__/genie';
import { DasClientProvider } from '@/contexts/DasClient';
import { ResortProvider } from '@/contexts/Resort';
import kvdb from '@/kvdb';
import { click, loading, render, revisitTab, see, setTime } from '@/testing';

import Merlock from '../../Merlock';
import { TAB_KEY, getDefaultTab } from '../Home';

jest.mock('@/contexts/GenieClient');
jest.mock('@/contexts/LiveDataClient');
jest.mock('@/ping');

beforeEach(() => {
  kvdb.clear();
});

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setTime('10:00');
  });

  it('shows Genie+ home screen', async () => {
    render(
      <ResortProvider value={wdw}>
        <DasClientProvider value={{ parties: async () => [] } as any}>
          <Merlock />
        </DasClientProvider>
      </ResortProvider>
    );
    await loading();

    revisitTab(60);
    await loading();

    click('Times');
    expect(kvdb.get(TAB_KEY)).toBe('Times');

    click(`Park: ${mk.name}`);
    click(hs.name, 'radio');
    await loading();
    see(`Park: ${hs.name}`);
    click('Plans');
    click(booking.name);
    jest.spyOn(Element.prototype, 'scroll');
    await see.screen('Your Lightning Lane');
    click('Modify');
    await see.screen('Genie+');
    expect(see(`Park: ${mk.name}`)).toBeDisabled();
    expect(Element.prototype.scroll).toHaveBeenCalledTimes(2);
  });
});

describe('getDefaultTab()', () => {
  it('returns default tab', () => {
    expect(getDefaultTab()).toBe('Genie+');
    kvdb.set(TAB_KEY, 'Times');
    expect(getDefaultTab()).toBe('Times');
  });
});
