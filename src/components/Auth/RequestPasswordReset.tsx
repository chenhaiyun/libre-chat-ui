import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocalize } from '~/hooks';
import {
  useRequestPasswordResetMutation,
  useGetStartupConfig,
  TRequestPasswordReset,
  TRequestPasswordResetResponse,
} from '~/common/dataprovider';;

function RequestPasswordReset() {
  const localize = useLocalize();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TRequestPasswordReset>();
  const requestPasswordReset = useRequestPasswordResetMutation();
  const config = useGetStartupConfig();
  const [requestError, setRequestError] = useState<boolean>(false);
  const [resetLink, setResetLink] = useState<string | undefined>(undefined);
  const [headerText, setHeaderText] = useState<string>('');
  const [bodyText, setBodyText] = useState<React.ReactNode | undefined>(undefined);

  const onSubmit = (data: TRequestPasswordReset) => {
    requestPasswordReset.mutate(data, {
      onSuccess: (data: TRequestPasswordResetResponse) => {
        console.log('emailEnabled: ', config.data?.emailEnabled);
        if (!config.data?.emailEnabled) {
          setResetLink(data.link);
        }
      },
      onError: () => {
        setRequestError(true);
        setTimeout(() => {
          setRequestError(false);
        }, 5000);
      },
    });
  };

  useEffect(() => {
    if (requestPasswordReset.isSuccess) {
      if (config.data?.emailEnabled) {
        setHeaderText(localize('com_auth_reset_password_link_sent'));
        setBodyText(localize('com_auth_reset_password_email_sent'));
      } else {
        setHeaderText(localize('com_auth_reset_password'));
        setBodyText(
          <span>
            {localize('com_auth_click')}{' '}
            <a className="text-green-600 hover:underline" href={resetLink}>
              {localize('com_auth_here')}
            </a>{' '}
            {localize('com_auth_to_reset_your_password')}
          </span>,
        );
      }
    } else {
      setHeaderText(localize('com_auth_reset_password'));
      setBodyText(undefined);
    }
  }, [requestPasswordReset.isSuccess, config.data?.emailEnabled, resetLink, localize]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white pt-6 sm:pt-0">
      <div className="mt-6 w-96 overflow-hidden bg-white px-6 py-4 sm:max-w-md sm:rounded-lg">
        <h1 className="mb-4 text-center text-3xl font-semibold">{headerText}</h1>
        {requestError && (
          <div
            className="relative mt-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
            role="alert"
          >
            {localize('com_auth_error_reset_password')}
          </div>
        )}
        {bodyText ? (
          <div
            className="relative mt-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700"
            role="alert"
          >
            {bodyText}
          </div>
        ) : (
          <form
            className="mt-6"
            aria-label="Password reset form"
            method="POST"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mb-2">
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  autoComplete="off"
                  aria-label={localize('com_auth_email')}
                  {...register('email', {
                    required: localize('com_auth_email_required'),
                    minLength: {
                      value: 3,
                      message: localize('com_auth_email_min_length'),
                    },
                    maxLength: {
                      value: 120,
                      message: localize('com_auth_email_max_length'),
                    },
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: localize('com_auth_email_pattern'),
                    },
                  })}
                  aria-invalid={!!errors.email}
                  className="peer block w-full appearance-none rounded-t-md border-0 border-b-2 border-gray-300 bg-gray-50 px-2.5 pb-2.5 pt-5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-0"
                  placeholder=" "
                ></input>
                <label
                  htmlFor="email"
                  className="absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-green-500"
                >
                  {localize('com_auth_email_address')}
                </label>
              </div>
              {errors.email && (
                <span role="alert" className="mt-1 text-sm text-red-600">
                  {/* @ts-ignore not sure why */}
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={!!errors.email}
                className="w-full rounded-sm border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none active:bg-green-500"
              >
                {localize('com_auth_continue')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RequestPasswordReset;
