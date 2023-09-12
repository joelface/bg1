import { AuthData } from '@/api/auth/client';
import { ReauthNeeded } from '@/api/auth/store';
import { DISCLAIMER_ACCEPTED_KEY } from '@/hooks/useDisclaimer';
import { NEWS_VERSION_KEY } from '@/hooks/useNews';
import { act, click, render, screen, see } from '@/testing';

import App, { NEWS_VERSION } from '../App';
import Screen from '../Screen';

jest.mock('../genie/Merlock', () => {
  return function Merlock() {
    return <Screen heading="Genie+">test</Screen>;
  };
});
jest.mock('../LoginForm', () => {
  function LoginForm({ onLogin }: { onLogin: (data: AuthData) => void }) {
    const onClick = () =>
      onLogin({
        swid: '{MINNIE}',
        accessToken: 'm1nn13',
        expires: new Date(2121, 12, 21, 12, 21, 12),
      });
    return <button onClick={onClick}>Log In</button>;
  }
  return LoginForm;
});

window.origin = 'https://disneyworld.disney.go.com';

const authStore = {
  getData: jest.fn(),
  setData: jest.fn(),
  deleteData: jest.fn(),
  onUnauthorized: jest.fn(),
};

function renderComponent() {
  render(<App authStore={authStore} />);
}

describe('App', () => {
  beforeEach(() => {
    authStore.getData.mockReturnValue({
      swid: '{MICKEY}',
      accessToken: 'm1ck3y',
    });
    localStorage.setItem(DISCLAIMER_ACCEPTED_KEY, '1');
    localStorage.setItem(NEWS_VERSION_KEY, '1');
  });

  it('shows Disclaimer if not yet accepted', async () => {
    localStorage.removeItem(DISCLAIMER_ACCEPTED_KEY);
    renderComponent();
    await see.screen('Warning!');
    click('Accept');
    expect(localStorage.getItem(DISCLAIMER_ACCEPTED_KEY)).toBe('1');
  });

  it('shows News if newer than last seen', async () => {
    localStorage.setItem(NEWS_VERSION_KEY, '-1');
    renderComponent();
    await see.screen('BG1 News');
    click('Close');
    expect(localStorage.getItem(NEWS_VERSION_KEY)).toBe(String(NEWS_VERSION));
  });

  it('loads client if auth data valid', async () => {
    renderComponent();
    await see.screen('Genie+');
  });

  it('shows LoginForm if auth data expired', async () => {
    authStore.getData.mockImplementationOnce(() => {
      throw new ReauthNeeded('auth');
    });
    renderComponent();
    click(await screen.findByRole('button', { name: 'Log In' }));
    expect(authStore.setData).lastCalledWith({
      swid: '{MINNIE}',
      accessToken: 'm1nn13',
      expires: new Date(2121, 12, 21, 12, 21, 12),
    });
    await see.screen('Genie+');
  });

  it('shows LoginForm if client.onAuthorized() called', async () => {
    renderComponent();
    await see.screen('Genie+');
    act(() => authStore.onUnauthorized());
    see('Log In');
  });
});
