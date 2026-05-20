import React from 'react';
import { Text } from 'folds';
import { Link } from 'react-router-dom';
import { SSOAction } from 'matrix-js-sdk';
import { AuthOption, useClientConfig } from '../../../hooks/useClientConfig';
import { ParsedLoginFlows } from '../../../hooks/useParsedLoginFlows';
import { getAuthUI, getBranding } from '../../../config/branding';
import { AuthOptions } from '../AuthOptions';
import { PasswordLoginForm } from './PasswordLoginForm';
import { SSOLogin } from '../SSOLogin';
import { getRegisterPath } from '../../pathUtils';
import { LoginPathSearchParams } from '../../paths';

type LoginOptionsProps = {
  server: string;
  parsedFlows: ParsedLoginFlows;
  loginSearchParams: LoginPathSearchParams;
  ssoRedirectUrl: string;
};

export function LoginOptions({
  server,
  parsedFlows,
  loginSearchParams,
  ssoRedirectUrl,
}: LoginOptionsProps) {
  const clientConfig = useClientConfig();
  const branding = getBranding(clientConfig);
  const authUI = getAuthUI(clientConfig);

  const isOptionAvailable = (option: AuthOption): boolean => {
    if (option === 'sso') return parsedFlows.sso !== undefined;
    if (option === 'password') return parsedFlows.password !== undefined;
    if (option === 'account-switch') return true;
    return false;
  };

  const renderAuthOption = (option: AuthOption) => {
    if (option === 'sso' && parsedFlows.sso) {
      return (
        <SSOLogin
          providers={parsedFlows.sso.identity_providers}
          redirectUrl={ssoRedirectUrl}
          action={SSOAction.LOGIN}
          saveScreenSpace={false}
        />
      );
    }

    if (option === 'password' && parsedFlows.password) {
      return (
        <PasswordLoginForm
          defaultUsername={loginSearchParams.username}
          defaultEmail={loginSearchParams.email}
        />
      );
    }

    if (option === 'account-switch') {
      return (
        <Text align="Center">
          Do not have an account? <Link to={getRegisterPath(server)}>Register</Link>
        </Text>
      );
    }

    return null;
  };

  return (
    <AuthOptions
      primaryOptions={authUI.primaryOptions}
      otherOptions={authUI.otherOptions}
      showOtherLabel={branding.showOtherAuthOptionsLabel}
      isAvailable={isOptionAvailable}
      renderOption={renderAuthOption}
    />
  );
}
