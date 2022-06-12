import { act, click, render, screen } from '/testing';
import { AuthData } from '/api/auth/client';
import { ReauthNeeded } from '/api/auth/store';
import { ClientProvider } from '/contexts/Client';
import { DISCLAIMER_ACCEPTED_KEY } from '/hooks/useDisclaimer';
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
const renderComponent = () =>
  render(
    <ClientProvider value={client}>
      <App authStore={authStore}>client loaded</App>
    </ClientProvider>
  );

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
    expect(screen.getByText('Warning!')).toBeInTheDocument();
  });

  it('loads client if auth data valid', () => {
    renderComponent();
    expect(screen.getByText('client loaded')).toBeInTheDocument();
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
    expect(screen.getByText('client loaded')).toBeInTheDocument();
  });

  it('shows LoginForm if client.onAuthorized() called', async () => {
    renderComponent();
    screen.getByText('client loaded');
    act(() => {
      client.onUnauthorized();
    });
    await screen.findByText('Log In');
  });
});
