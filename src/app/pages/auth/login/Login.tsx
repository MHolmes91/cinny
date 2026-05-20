import React, { useMemo } from 'react';
import { Box, Text, color } from 'folds';
import { useSearchParams } from 'react-router-dom';
import { useAuthFlows } from '../../../hooks/useAuthFlows';
import { useAuthServer } from '../../../hooks/useAuthServer';
import { ParsedLoginFlows, useParsedLoginFlows } from '../../../hooks/useParsedLoginFlows';
import { TokenLogin } from './TokenLogin';
import { getLoginPath, withSearchParam } from '../../pathUtils';
import { usePathWithOrigin } from '../../../hooks/usePathWithOrigin';
import { LoginPathSearchParams } from '../../paths';
import { useClientConfig } from '../../../hooks/useClientConfig';
import { LoginOptions } from './LoginOptions';

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

  const parsedFlows: ParsedLoginFlows = useParsedLoginFlows(loginFlows.flows);

  return (
    <Box direction="Column" gap="500">
      <Text size="H2" priority="400">
        Login
      </Text>
      {parsedFlows.token && loginSearchParams.loginToken && (
        <TokenLogin token={loginSearchParams.loginToken} />
      )}
      <LoginOptions
        server={server}
        parsedFlows={parsedFlows}
        loginSearchParams={loginSearchParams}
        ssoRedirectUrl={ssoRedirectUrl}
      />
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
