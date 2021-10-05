import { h } from 'preact';
import { render, screen } from '@testing-library/preact';

import { AuthClient } from '../../auth-client';
import LoginForm from '../LoginForm';

jest.mock('../../auth-client');

const AuthClientMock = AuthClient as jest.Mock<AuthClient>;

describe('LoginForm', () => {
  it('starts AuthClient', () => {
    const onLogin = jest.fn();
    render(<LoginForm onLogin={onLogin} />);
    const iframe = screen.getByTitle('Disney Login Form');
    expect(AuthClientMock).toBeCalledWith(iframe, onLogin);
    expect(AuthClientMock.mock.instances[0].open).toBeCalledTimes(1);
  });
});
