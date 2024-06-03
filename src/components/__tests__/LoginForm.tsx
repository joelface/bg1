import { AuthClient } from '@/api/auth/client';
import { render, see } from '@/testing';

import LoginForm from '../LoginForm';

jest.mock('@/api/auth/client');

describe('LoginForm', () => {
  it('starts AuthClient', () => {
    const onLogin = jest.fn();
    const resort = { id: 'WDW' as const };
    render(<LoginForm onLogin={onLogin} resort={resort} />);
    const iframe = see('Disney Login Form');
    expect(AuthClient).toHaveBeenCalledWith(iframe, onLogin, resort);
    expect(AuthClient.prototype.open).toHaveBeenCalledTimes(1);
  });
});
