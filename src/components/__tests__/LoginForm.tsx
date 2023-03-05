import { AuthClient } from '@/api/auth/client';
import { render, see } from '@/testing';

import LoginForm from '../LoginForm';

jest.mock('@/api/auth/client');

const AuthClientMock = AuthClient as jest.Mock<AuthClient>;

describe('LoginForm', () => {
  it('starts AuthClient', () => {
    const onLogin = jest.fn();
    render(<LoginForm onLogin={onLogin} resort="WDW" />);
    const iframe = see('Disney Login Form');
    expect(AuthClientMock).toBeCalledWith(iframe, onLogin, 'WDW');
    expect(AuthClientMock.mock.instances[0].open).toBeCalledTimes(1);
  });
});
