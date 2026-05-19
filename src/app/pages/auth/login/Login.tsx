import React, { useMemo, useState } from 'react';
import { Box, Button, Text, color } from 'folds';
import { Link, useSearchParams } from 'react-router-dom';
import { SSOAction } from 'matrix-js-sdk';
import { useAuthFlows } from '../../../hooks/useAuthFlows';
import { useAuthServer } from '../../../hooks/useAuthServer';
import { useParsedLoginFlows } from '../../../hooks/useParsedLoginFlows';
import { PasswordLoginForm } from './PasswordLoginForm';
import { SSOLogin } from '../SSOLogin';
import { TokenLogin } from './TokenLogin';
import { OrDivider } from '../OrDivider';
import { getLoginPath, getRegisterPath, withSearchParam } from '../../pathUtils';
import { usePathWithOrigin } from '../../../hooks/usePathWithOrigin';
import { LoginPathSearchParams } from '../../paths';
import { AuthOption, useClientConfig } from '../../../hooks/useClientConfig';
import { getAuthUI, getBranding } from '../../../config/branding';

const getLoginTokenSearchParam = () => {
  // when using hasRouter query params in existing route
  // gets ignored by react-router, so we need to read it ourself
  // we only need to read loginToken as it's the only param that
  // is provided by external entity. example: SSO login
  const parmas = new URLSearchParams(window.location.search);
  const loginToken = parmas.get('loginToken');
  return loginToken ?? undefined;
};

const useLoginSearchParams = (searchParams: URLSearchParams): LoginPathSearchParams =>
  useMemo(
    () => ({
      username: searchParams.get('username') ?? undefined,
      email: searchParams.get('email') ?? undefined,
      loginToken: searchParams.get('loginToken') ?? undefined,
    }),
    [searchParams]
  );

export function Login() {
  const server = useAuthServer();
  const clientConfig = useClientConfig();
  const { hashRouter } = clientConfig;
  const branding = getBranding(clientConfig);
  const authUI = getAuthUI(clientConfig);
  const { loginFlows } = useAuthFlows();
  const [searchParams] = useSearchParams();
  const loginSearchParams = useLoginSearchParams(searchParams);
  const ssoRedirectUrl = usePathWithOrigin(getLoginPath(server));
  const loginTokenForHashRouter = getLoginTokenSearchParam();
  const absoluteLoginPath = usePathWithOrigin(getLoginPath(server));

  if (hashRouter?.enabled && loginTokenForHashRouter) {
    window.location.replace(
      withSearchParam(absoluteLoginPath, {
        loginToken: loginTokenForHashRouter,
      })
    );
  }

  const parsedFlows = useParsedLoginFlows(loginFlows.flows);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const isOptionAvailable = (option: AuthOption | string): boolean => {
    if (option === 'sso') return parsedFlows.sso !== undefined;
    if (option === 'password') return parsedFlows.password !== undefined;
    if (option === 'account-switch') return true;
    return false;
  };
  const hasPrimaryOptions = authUI.primaryOptions.some(isOptionAvailable);
  const collapseOtherOptions = hasPrimaryOptions && authUI.otherOptions.length > 0;
  const showSecondaryOptions = !collapseOtherOptions || showOtherOptions;

  const renderAuthOption = (option: AuthOption | string) => {
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
    <Box direction="Column" gap="500">
      <Text size="H2" priority="400">
        Login
      </Text>
      {parsedFlows.token && loginSearchParams.loginToken && (
        <TokenLogin token={loginSearchParams.loginToken} />
      )}
      {authUI.primaryOptions.map((option) => {
        const authOption = renderAuthOption(option);
        return authOption ? <React.Fragment key={option}>{authOption}</React.Fragment> : null;
      })}
      {collapseOtherOptions && !showOtherOptions && (
        <Button variant="Secondary" fill="Soft" onClick={() => setShowOtherOptions(true)}>
          <Text as="span" size="B400">
            {branding.showOtherAuthOptionsLabel}
          </Text>
        </Button>
      )}
      {showSecondaryOptions && (
        <>
          {hasPrimaryOptions && authUI.otherOptions.some(isOptionAvailable) && <OrDivider />}
          {authUI.otherOptions.map((option) => {
            const authOption = renderAuthOption(option);
            return authOption ? <React.Fragment key={option}>{authOption}</React.Fragment> : null;
          })}
        </>
      )}
      {!parsedFlows.password && !parsedFlows.sso && (
        <>
          <Text style={{ color: color.Critical.Main }}>
            {`This client does not support login on "${server}" homeserver. Password and SSO based login method not found.`}
          </Text>
          <span data-spacing-node />
        </>
      )}
    </Box>
  );
}
