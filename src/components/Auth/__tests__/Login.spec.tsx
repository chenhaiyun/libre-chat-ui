import { render, waitFor } from 'test/layout-test-utils';
import userEvent from '@testing-library/user-event';
import Login from '../Login';
import * as mockDataProvider from '~/common/dataprovider';;

jest.mock('~/common/dataprovider';);

const setup = ({
  useGetUserQueryReturnValue = {
    isLoading: false,
    isError: false,
    data: {},
  },
  useLoginUserReturnValue = {
    isLoading: false,
    isError: false,
    mutate: jest.fn(),
    data: {},
    isSuccess: false,
  },
  useRefreshTokenMutationReturnValue = {
    isLoading: false,
    isError: false,
    mutate: jest.fn(),
    data: {
      token: 'mock-token',
      user: {},
    },
  },
  useGetStartupCongfigReturnValue = {
    isLoading: false,
    isError: false,
    data: {
      googleLoginEnabled: true,
      facebookLoginEnabled: true,
      openidLoginEnabled: true,
      openidLabel: 'Test OpenID',
      openidImageUrl: 'http://test-server.com',
      githubLoginEnabled: true,
      discordLoginEnabled: true,
      registrationEnabled: true,
      socialLoginEnabled: true,
      serverDomain: 'mock-server',
    },
  },
} = {}) => {
  const mockUseLoginUser = jest
    .spyOn(mockDataProvider, 'useLoginUserMutation')
    //@ts-ignore - we don't need all parameters of the QueryObserverSuccessResult
    .mockReturnValue(useLoginUserReturnValue);
  const mockUseGetUserQuery = jest
    .spyOn(mockDataProvider, 'useGetUserQuery')
    //@ts-ignore - we don't need all parameters of the QueryObserverSuccessResult
    .mockReturnValue(useGetUserQueryReturnValue);
  const mockUseGetStartupConfig = jest
    .spyOn(mockDataProvider, 'useGetStartupConfig')
    //@ts-ignore - we don't need all parameters of the QueryObserverSuccessResult
    .mockReturnValue(useGetStartupCongfigReturnValue);
  const mockUseRefreshTokenMutation = jest
    .spyOn(mockDataProvider, 'useRefreshTokenMutation')
    //@ts-ignore - we don't need all parameters of the QueryObserverSuccessResult
    .mockReturnValue(useRefreshTokenMutationReturnValue);
  const renderResult = render(<Login />);
  return {
    ...renderResult,
    mockUseLoginUser,
    mockUseGetUserQuery,
    mockUseGetStartupConfig,
    mockUseRefreshTokenMutation,
  };
};

test('renders login form', () => {
  const { getByLabelText, getByRole } = setup();
  expect(getByLabelText(/email/i)).toBeInTheDocument();
  expect(getByLabelText(/password/i)).toBeInTheDocument();
  expect(getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  expect(getByRole('link', { name: /Sign up/i })).toBeInTheDocument();
  expect(getByRole('link', { name: /Sign up/i })).toHaveAttribute('href', '/register');
  expect(getByRole('link', { name: /Login with Google/i })).toBeInTheDocument();
  expect(getByRole('link', { name: /Login with Google/i })).toHaveAttribute(
    'href',
    'mock-server/oauth/google',
  );
  expect(getByRole('link', { name: /Login with Facebook/i })).toBeInTheDocument();
  expect(getByRole('link', { name: /Login with Facebook/i })).toHaveAttribute(
    'href',
    'mock-server/oauth/facebook',
  );
  expect(getByRole('link', { name: /Login with Github/i })).toBeInTheDocument();
  expect(getByRole('link', { name: /Login with Github/i })).toHaveAttribute(
    'href',
    'mock-server/oauth/github',
  );
  expect(getByRole('link', { name: /Login with Discord/i })).toBeInTheDocument();
  expect(getByRole('link', { name: /Login with Discord/i })).toHaveAttribute(
    'href',
    'mock-server/oauth/discord',
  );
});

test('calls loginUser.mutate on login', async () => {
  const mutate = jest.fn();
  const { getByLabelText, getByRole } = setup({
    // @ts-ignore - we don't need all parameters of the QueryObserverResult
    useLoginUserReturnValue: {
      isLoading: false,
      mutate: mutate,
      isError: false,
    },
  });

  const emailInput = getByLabelText(/email/i);
  const passwordInput = getByLabelText(/password/i);
  const submitButton = getByRole('button', { name: /Sign in/i });

  await userEvent.type(emailInput, 'test@test.com');
  await userEvent.type(passwordInput, 'password');
  await userEvent.click(submitButton);

  waitFor(() => expect(mutate).toHaveBeenCalled());
});

test('Navigates to / on successful login', async () => {
  const { getByLabelText, getByRole, history } = setup({
    // @ts-ignore - we don't need all parameters of the QueryObserverResult
    useLoginUserReturnValue: {
      isLoading: false,
      mutate: jest.fn(),
      isError: false,
      isSuccess: true,
    },
  });

  const emailInput = getByLabelText(/email/i);
  const passwordInput = getByLabelText(/password/i);
  const submitButton = getByRole('button', { name: /Sign in/i });

  await userEvent.type(emailInput, 'test@test.com');
  await userEvent.type(passwordInput, 'password');
  await userEvent.click(submitButton);

  waitFor(() => expect(history.location.pathname).toBe('/'));
});
