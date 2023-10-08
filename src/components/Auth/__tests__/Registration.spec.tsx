import { render, waitFor, screen } from 'test/layout-test-utils';
import userEvent from '@testing-library/user-event';
import Registration from '../Registration';
import * as mockDataProvider from '~/common/dataprovider';;

jest.mock('~/common/dataprovider';);

const setup = ({
  useGetUserQueryReturnValue = {
    isLoading: false,
    isError: false,
    data: {},
  },
  useRegisterUserMutationReturnValue = {
    isLoading: false,
    isError: false,
    mutate: jest.fn(),
    data: {},
    isSuccess: false,
    error: null as Error | null,
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
  const mockUseRegisterUserMutation = jest
    .spyOn(mockDataProvider, 'useRegisterUserMutation')
    //@ts-ignore - we don't need all parameters of the QueryObserverSuccessResult
    .mockReturnValue(useRegisterUserMutationReturnValue);
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
  const renderResult = render(<Registration />);

  return {
    ...renderResult,
    mockUseRegisterUserMutation,
    mockUseGetUserQuery,
    mockUseGetStartupConfig,
    mockUseRefreshTokenMutation,
  };
};

test('renders registration form', () => {
  const { getByText, getByTestId, getByRole } = setup();
  expect(getByText(/Create your account/i)).toBeInTheDocument();
  expect(getByRole('textbox', { name: /Full name/i })).toBeInTheDocument();
  expect(getByRole('form', { name: /Registration form/i })).toBeVisible();
  expect(getByRole('textbox', { name: /Username/i })).toBeInTheDocument();
  expect(getByRole('textbox', { name: /Email/i })).toBeInTheDocument();
  expect(getByTestId('password')).toBeInTheDocument();
  expect(getByTestId('confirm_password')).toBeInTheDocument();
  expect(getByRole('button', { name: /Submit registration/i })).toBeInTheDocument();
  expect(getByRole('link', { name: 'Login' })).toBeInTheDocument();
  expect(getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
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

// eslint-disable-next-line jest/no-commented-out-tests
// test('calls registerUser.mutate on registration', async () => {
//   const mutate = jest.fn();
//   const { getByTestId, getByRole, history } = setup({
//     // @ts-ignore - we don't need all parameters of the QueryObserverResult
//     useLoginUserReturnValue: {
//       isLoading: false,
//       mutate: mutate,
//       isError: false,
//       isSuccess: true,
//     },
//   });

//   await userEvent.type(getByRole('textbox', { name: /Full name/i }), 'John Doe');
//   await userEvent.type(getByRole('textbox', { name: /Username/i }), 'johndoe');
//   await userEvent.type(getByRole('textbox', { name: /Email/i }), 'test@test.com');
//   await userEvent.type(getByTestId('password'), 'password');
//   await userEvent.type(getByTestId('confirm_password'), 'password');
//   await userEvent.click(getByRole('button', { name: /Submit registration/i }));

//   console.log(history);
//   waitFor(() => {
//     // expect(mutate).toHaveBeenCalled();
//     expect(history.location.pathname).toBe('/chat/new');
//   });
// });

test('shows validation error messages', async () => {
  const { getByTestId, getAllByRole, getByRole } = setup();
  await userEvent.type(getByRole('textbox', { name: /Full name/i }), 'J');
  await userEvent.type(getByRole('textbox', { name: /Username/i }), 'j');
  await userEvent.type(getByRole('textbox', { name: /Email/i }), 'test');
  await userEvent.type(getByTestId('password'), 'pass');
  await userEvent.type(getByTestId('confirm_password'), 'password1');
  const alerts = getAllByRole('alert');
  expect(alerts).toHaveLength(5);
  expect(alerts[0]).toHaveTextContent(/Name must be at least 3 characters/i);
  expect(alerts[1]).toHaveTextContent(/Username must be at least 2 characters/i);
  expect(alerts[2]).toHaveTextContent(/You must enter a valid email address/i);
  expect(alerts[3]).toHaveTextContent(/Password must be at least 8 characters/i);
  expect(alerts[4]).toHaveTextContent(/Passwords do not match/i);
});

test('shows error message when registration fails', async () => {
  const mutate = jest.fn();
  const { getByTestId, getByRole } = setup({
    useRegisterUserMutationReturnValue: {
      isLoading: false,
      isError: true,
      mutate,
      error: new Error('Registration failed'),
      data: {},
      isSuccess: false,
    },
  });

  await userEvent.type(getByRole('textbox', { name: /Full name/i }), 'John Doe');
  await userEvent.type(getByRole('textbox', { name: /Username/i }), 'johndoe');
  await userEvent.type(getByRole('textbox', { name: /Email/i }), 'test@test.com');
  await userEvent.type(getByTestId('password'), 'password');
  await userEvent.type(getByTestId('confirm_password'), 'password');
  await userEvent.click(getByRole('button', { name: /Submit registration/i }));

  waitFor(() => {
    expect(screen.getByTestId('registration-error')).toBeInTheDocument();
    expect(screen.getByTestId('registration-error')).toHaveTextContent(
      /There was an error attempting to register your account. Please try again. Registration failed/i,
    );
  });
});
