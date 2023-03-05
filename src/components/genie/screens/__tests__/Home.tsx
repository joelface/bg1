import { hs, mk } from '@/__fixtures__/genie';
import {
  click,
  elemScrollMock,
  loading,
  render,
  revisitTab,
  see,
  setTime,
  waitFor,
} from '@/testing';

import Merlock from '../../Merlock';
import { DEFAULT_TAB_KEY, getDefaultTab } from '../Home';

jest.mock('@/contexts/GenieClient');
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
    render(<Merlock />);
    await loading();

    revisitTab(60);
    await loading();

    click('Times');
    expect(localStorage.getItem(DEFAULT_TAB_KEY)).toBe('Times');

    click(`Park: ${mk.name}`);
    click(hs.name, 'radio');
    await loading();
    see(`Park: ${hs.name}`);
    click('Your Day');
    await waitFor(() => click(see.all('Info')[1]));
    elemScrollMock.mockClear();
    await see.screen('Your Lightning Lane');
    click('Modify');
    await see.screen('Genie+');
    see(`Park: ${mk.name}`);
    expect(elemScrollMock).toBeCalledTimes(2);
  });
});

describe('getDefaultTab()', () => {
  it('returns default tab', () => {
    expect(getDefaultTab()).toBe('Genie+');
    localStorage.setItem(DEFAULT_TAB_KEY, 'Times');
    expect(getDefaultTab()).toBe('Times');
  });
});
