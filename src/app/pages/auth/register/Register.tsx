import React, { useMemo } from 'react';
import { Box, Text } from 'folds';
import { useSearchParams } from 'react-router-dom';
import { useAuthServer } from '../../../hooks/useAuthServer';
import { useAuthFlows } from '../../../hooks/useAuthFlows';
import { useParsedLoginFlows } from '../../../hooks/useParsedLoginFlows';
import { getLoginPath } from '../../pathUtils';
import { usePathWithOrigin } from '../../../hooks/usePathWithOrigin';
import { RegisterPathSearchParams } from '../../paths';
import { RegisterOptions } from './RegisterOptions';

const useRegisterSearchParams = (searchParams: URLSearchParams): RegisterPathSearchParams =>
  useMemo(
    () => ({
      username: searchParams.get('username') ?? undefined,
      email: searchParams.get('email') ?? undefined,
      token: searchParams.get('token') ?? undefined,
    }),
    [searchParams]
  );

export function Register() {
  const server = useAuthServer();
  const { loginFlows, registerFlows } = useAuthFlows();
  const [searchParams] = useSearchParams();
  const registerSearchParams = useRegisterSearchParams(searchParams);
  const parsedFlows = useParsedLoginFlows(loginFlows.flows);

  // redirect to /login because only that path handle m.login.token
  const ssoRedirectUrl = usePathWithOrigin(getLoginPath(server));

  return (
    <Box direction="Column" gap="500">
      <Text size="H2" priority="400">
        Register
      </Text>
      <RegisterOptions
        server={server}
        parsedFlows={parsedFlows}
        registerFlows={registerFlows}
        registerSearchParams={registerSearchParams}
        ssoRedirectUrl={ssoRedirectUrl}
      />
    </Box>
  );
}
