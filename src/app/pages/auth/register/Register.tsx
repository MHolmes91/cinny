import React, { useMemo, useState } from 'react';
import { Box, Button, Text, color } from 'folds';
import { Link, useSearchParams } from 'react-router-dom';
import { SSOAction } from 'matrix-js-sdk';
import { useAuthServer } from '../../../hooks/useAuthServer';
import { RegisterFlowStatus, useAuthFlows } from '../../../hooks/useAuthFlows';
import { useParsedLoginFlows } from '../../../hooks/useParsedLoginFlows';
import { PasswordRegisterForm, SUPPORTED_REGISTER_STAGES } from '../register/PasswordRegisterForm';
import { OrDivider } from '../OrDivider';
import { SSOLogin } from '../SSOLogin';
import { SupportedUIAFlowsLoader } from '../../../components/SupportedUIAFlowsLoader';
import { getLoginPath } from '../../pathUtils';
import { usePathWithOrigin } from '../../../hooks/usePathWithOrigin';
import { RegisterPathSearchParams } from '../../paths';
import { branding } from '../../../config/branding';

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
  const { sso } = useParsedLoginFlows(loginFlows.flows);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const collapseOtherOptions = sso !== undefined;
  const showSecondaryOptions = !collapseOtherOptions || showOtherOptions;

  // redirect to /login because only that path handle m.login.token
  const ssoRedirectUrl = usePathWithOrigin(getLoginPath(server));

  return (
    <Box direction="Column" gap="500">
      <Text size="H2" priority="400">
        Register
      </Text>
      {sso && (
        <>
          <SSOLogin
            providers={sso.identity_providers}
            redirectUrl={ssoRedirectUrl}
            action={SSOAction.REGISTER}
            saveScreenSpace={false}
          />
          <span data-spacing-node />
        </>
      )}
      {collapseOtherOptions && !showOtherOptions && (
        <Button variant="Secondary" fill="Soft" onClick={() => setShowOtherOptions(true)}>
          <Text as="span" size="B400">
            {branding.showOtherRegisterOptionsLabel}
          </Text>
        </Button>
      )}
      {showSecondaryOptions && registerFlows.status === RegisterFlowStatus.RegistrationDisabled && (
        <Text style={{ color: color.Critical.Main }} size="T300">
          Registration has been disabled on this homeserver.
        </Text>
      )}
      {showSecondaryOptions && registerFlows.status === RegisterFlowStatus.RateLimited && (
        <Text style={{ color: color.Critical.Main }} size="T300">
          You have been rate-limited! Please try after some time.
        </Text>
      )}
      {showSecondaryOptions && registerFlows.status === RegisterFlowStatus.InvalidRequest && (
        <Text style={{ color: color.Critical.Main }} size="T300">
          Invalid Request! Failed to get any registration options.
        </Text>
      )}
      {showSecondaryOptions && registerFlows.status === RegisterFlowStatus.FlowRequired && (
        <>
          {sso && <OrDivider />}
          <SupportedUIAFlowsLoader
            flows={registerFlows.data.flows ?? []}
            supportedStages={SUPPORTED_REGISTER_STAGES}
          >
            {(supportedFlows) =>
              supportedFlows.length === 0 ? (
                <Text style={{ color: color.Critical.Main }} size="T300">
                  This application does not support registration on this homeserver.
                </Text>
              ) : (
                <PasswordRegisterForm
                  authData={registerFlows.data}
                  uiaFlows={supportedFlows}
                  defaultUsername={registerSearchParams.username}
                  defaultEmail={registerSearchParams.email}
                  defaultRegisterToken={registerSearchParams.token}
                />
              )
            }
          </SupportedUIAFlowsLoader>
          <span data-spacing-node />
        </>
      )}
      {showSecondaryOptions && (
        <Text align="Center">
          Already have an account? <Link to={getLoginPath(server)}>Login</Link>
        </Text>
      )}
    </Box>
  );
}
