import { h } from 'preact';
import { render } from '@testing-library/preact';

import { AuthClient } from '../../auth-client';
import LoginForm from '../LoginForm';

jest.mock('../../auth-client');

const AuthClientMock = AuthClient as jest.Mock<AuthClient>;

describe('LoginForm', () => {
  it('starts AuthClient', () => {
    const onLogin = jest.fn();
    const { container } = render(<LoginForm onLogin={onLogin} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(AuthClientMock).toBeCalledWith(iframe, onLogin);
    expect(AuthClientMock.mock.instances[0].open).toBeCalledTimes(1);
  });
});
