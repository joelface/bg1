import { AuthData } from '@/api/auth/client';
import { ReauthNeeded } from '@/api/auth/store';
import { DISCLAIMER_ACCEPTED_KEY } from '@/hooks/useDisclaimer';
import { act, click, render, see } from '@/testing';

import App from '../App';

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

const authStore = {
  getData: jest.fn(),
  setData: jest.fn(),
  deleteData: jest.fn(),
};

const client = {
  onUnauthorized: () => null,
  logOut: () => null,
  resort: 'WDW' as const,
};

function renderComponent() {
  render(
    <App client={client} authStore={authStore}>
      <>client loaded</>
    </App>
  );
}

describe('App', () => {
  beforeEach(() => {
    authStore.getData.mockReturnValue({
      swid: '{MICKEY}',
      accessToken: 'm1ck3y',
    });
    localStorage.setItem(DISCLAIMER_ACCEPTED_KEY, '1');
  });

  it('shows Disclaimer if not yet accepted', () => {
    localStorage.removeItem(DISCLAIMER_ACCEPTED_KEY);
    renderComponent();
    see('Warning!');
  });

  it('loads client if auth data valid', () => {
    renderComponent();
    see('client loaded');
  });

  it('shows LoginForm if auth data expired', () => {
    authStore.getData.mockImplementationOnce(() => {
      throw new ReauthNeeded('auth');
    });
    renderComponent();
    click('Log In');
    expect(authStore.setData).lastCalledWith({
      swid: '{MINNIE}',
      accessToken: 'm1nn13',
      expires: new Date(2121, 12, 21, 12, 21, 12),
    });
    see('client loaded');
  });

  it('shows LoginForm if client.onAuthorized() called', async () => {
    renderComponent();
    see('client loaded');
    act(() => {
      client.onUnauthorized();
    });
    see('Log In');
  });
});
