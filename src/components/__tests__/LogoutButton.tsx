import { ClientProvider } from '/contexts/Client';
import { click, render } from '/testing';
import LogoutButton from '../LogoutButton';

describe('LogoutButton', () => {
  it('renders button', () => {
    const client = {
      onUnauthorized: () => null,
      logOut: jest.fn(),
      resort: 'WDW' as const,
    };
    render(
      <ClientProvider value={client}>
        <LogoutButton />
      </ClientProvider>
    );
    click('Log Out');
    expect(client.logOut).toBeCalled();
  });
});
