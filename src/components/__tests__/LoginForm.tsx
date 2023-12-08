import { AuthClient } from '@/api/auth/client';
import { render, see } from '@/testing';

import LoginForm from '../LoginForm';

jest.mock('@/api/auth/client');

describe('LoginForm', () => {
  it('starts AuthClient', () => {
    const onLogin = jest.fn();
    render(<LoginForm onLogin={onLogin} resort="WDW" />);
    const iframe = see('Disney Login Form');
    expect(AuthClient).toBeCalledWith(iframe, onLogin, 'WDW');
    expect(AuthClient.prototype.open).toBeCalledTimes(1);
  });
});
