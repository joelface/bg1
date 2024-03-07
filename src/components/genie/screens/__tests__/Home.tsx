import { booking, hs, mk, wdw } from '@/__fixtures__/genie';
import { DasClientProvider } from '@/contexts/DasClient';
import { ResortDataProvider } from '@/contexts/ResortData';
import { click, loading, render, revisitTab, see, setTime } from '@/testing';

import Merlock from '../../Merlock';
import { DEFAULT_TAB_KEY, getDefaultTab } from '../Home';

jest.mock('@/contexts/GenieClient');
jest.mock('@/contexts/LiveDataClient');
jest.mock('@/ping');

beforeEach(() => {
  localStorage.clear();
});

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setTime('10:00');
  });

  it('shows Genie+ home screen', async () => {
    render(
      <ResortDataProvider value={wdw}>
        <DasClientProvider value={{ parties: async () => [] } as any}>
          <Merlock />
        </DasClientProvider>
      </ResortDataProvider>
    );
    await loading();

    revisitTab(60);
    await loading();

    click('Times');
    expect(localStorage.getItem(DEFAULT_TAB_KEY)).toBe('Times');

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
    localStorage.setItem(DEFAULT_TAB_KEY, 'Times');
    expect(getDefaultTab()).toBe('Times');
  });
});
