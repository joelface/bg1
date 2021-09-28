import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';

import { ApiClient, VQ_ORIGINS } from '../../virtual-queue';
import { TokenStale } from '../../token';
import App from '../App';
import { useDisclaimer } from '../Disclaimer';

jest.mock('../BGClient', () => {
  const BGClient = () => <p>BGClient</p>;
  return BGClient;
});
jest.mock('../LoginForm', () => {
  function LoginForm({
    onLogin,
  }: {
    onLogin: (token: string, expires: Date) => void;
  }) {
    const onClick = () => onLogin('m1nn13', new Date(2121, 12, 21, 12, 21, 12));
    return <button onClick={onClick}>Log In</button>;
  }
  return LoginForm;
});
jest.mock('../Disclaimer', () => {
  const Disclaimer = () => <p>Disclaimer</p>;
  return {
    __esModule: true,
    default: Disclaimer,
    useDisclaimer: jest.fn(),
  };
});
const useDisclaimerMock = useDisclaimer as jest.MockedFunction<
  typeof useDisclaimer
>;

const { getByRole, getByText } = screen;

const client = new ApiClient(VQ_ORIGINS.WDW, jest.fn(), jest.fn());
const token = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

function renderApp() {
  render(<App accessToken={token} client={client} />);
}

describe('App', () => {
  beforeEach(() => {
    token.get.mockReturnValue('m1ck3y');
    useDisclaimerMock.mockReturnValue([true, () => null]);
  });

  it('shows Disclaimer if not yet accepted', () => {
    useDisclaimerMock.mockReturnValue([false, () => null]);
    renderApp();
    expect(getByText('Disclaimer')).toBeInTheDocument();
  });

  it('shows BGClient if token valid', () => {
    renderApp();
    expect(getByText('BGClient')).toBeInTheDocument();
  });

  it('shows LoginForm if token expired', () => {
    token.get.mockImplementationOnce(() => {
      throw new TokenStale('accessToken');
    });
    renderApp();
    fireEvent.click(getByRole('button', { name: 'Log In' }));
    expect(token.set).lastCalledWith(
      'm1nn13',
      new Date(2121, 12, 21, 12, 21, 12)
    );
    expect(getByText('BGClient')).toBeInTheDocument();
  });
});
