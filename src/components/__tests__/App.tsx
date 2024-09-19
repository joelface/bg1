import { AuthData, ReauthNeeded, authStore } from '@/api/auth';
import { fetchJson } from '@/fetch';
import { DISCLAIMER_ACCEPTED_KEY } from '@/hooks/useDisclaimer';
import { NEWS_VERSION_KEY } from '@/hooks/useNews';
import kvdb from '@/kvdb';
import { act, click, render, screen, see, waitFor } from '@/testing';

import App, { NEWS_VERSION } from '../App';
import Screen from '../Screen';

jest.mock('@/fetch');
jest.mock('../ll/Merlock', () => {
  return function Merlock() {
    return <Screen title="LL">test</Screen>;
  };
});
jest.mock('../vq/BGClient', () => {
  return function BGClient() {
    return <Screen title="Virtual Queues">test</Screen>;
  };
});
jest.mock('../LoginForm', () => {
  function LoginForm({ onLogin }: { onLogin: (data: AuthData) => void }) {
    const onClick = () =>
      onLogin({
        swid: '{MINNIE}',
        accessToken: 'm1nn13',
        expires: new Date(2121, 12, 21, 12, 21, 12).getTime(),
      });
    return <button onClick={onClick}>Log In</button>;
  }
  return LoginForm;
});
jest.spyOn(authStore, 'getData').mockReturnValue({ accessToken: '', swid: '' });

function renderComponent() {
  render(<App />);
}

describe('App', () => {
  beforeEach(() => {
    self.origin = 'https://disneyworld.disney.go.com';
    jest.clearAllMocks();
    kvdb.set(DISCLAIMER_ACCEPTED_KEY, 1);
    kvdb.set(NEWS_VERSION_KEY, 1);
  });

  it('shows Disclaimer if not yet accepted', async () => {
    kvdb.delete(DISCLAIMER_ACCEPTED_KEY);
    renderComponent();
    await see.screen('Warning!');
    click('Accept');
    expect(kvdb.get(DISCLAIMER_ACCEPTED_KEY)).toBe(1);
  });

  it('shows News if newer than last seen', async () => {
    kvdb.set(NEWS_VERSION_KEY, -1);
    renderComponent();
    await see.screen('BG1 News');
    click('Close');
    expect(kvdb.get(NEWS_VERSION_KEY)).toBe(NEWS_VERSION);
  });

  it('loads client if auth data valid', async () => {
    renderComponent();
    await see.screen('LL');
  });

  it('shows LoginForm if auth data expired', async () => {
    jest.mocked(authStore.getData).mockImplementationOnce(() => {
      throw new ReauthNeeded();
    });
    jest.spyOn(authStore, 'setData');
    renderComponent();
    click(await screen.findByRole('button', { name: 'Log In' }));
    expect(authStore.setData).toHaveBeenLastCalledWith({
      swid: '{MINNIE}',
      accessToken: 'm1nn13',
      expires: new Date(2121, 12, 21, 12, 21, 12).getTime(),
    });
    await see.screen('LL');
  });

  it('shows LoginForm if client.onAuthorized() called', async () => {
    renderComponent();
    await see.screen('LL');
    act(() => authStore.onUnauthorized());
    see('Log In');
  });

  it('loads DLR VQ component', async () => {
    jest
      .mocked(fetchJson)
      .mockResolvedValue({ ok: true, status: 200, data: { queues: [] } });
    self.origin = 'https://vqguest-svc.wdprapps.disney.com';
    renderComponent();
    await see.screen('Virtual Queues');
  });

  it('redirects to start page if BG1 cannot be run from this origin', async () => {
    self.origin = 'https://example.com';
    Object.defineProperty(self, 'location', {
      value: { assign: jest.fn() },
    });
    renderComponent();
    await waitFor(() => {
      expect(self.location.assign).toHaveBeenCalledWith(
        'https://joelface.github.io/bg1/start.html'
      );
    });
  });
});
