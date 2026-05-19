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
import { AuthOption, useClientConfig } from '../../../hooks/useClientConfig';
import { getAuthUI, getBranding } from '../../../config/branding';

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
  const clientConfig = useClientConfig();
  const branding = getBranding(clientConfig);
  const authUI = getAuthUI(clientConfig);
  const { loginFlows, registerFlows } = useAuthFlows();
  const [searchParams] = useSearchParams();
  const registerSearchParams = useRegisterSearchParams(searchParams);
  const { sso } = useParsedLoginFlows(loginFlows.flows);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const passwordAvailable =
    registerFlows.status === RegisterFlowStatus.RegistrationDisabled ||
    registerFlows.status === RegisterFlowStatus.RateLimited ||
    registerFlows.status === RegisterFlowStatus.InvalidRequest ||
    registerFlows.status === RegisterFlowStatus.FlowRequired;
  const isOptionAvailable = (option: AuthOption | string): boolean => {
    if (option === 'sso') return sso !== undefined;
    if (option === 'password') return passwordAvailable;
    if (option === 'account-switch') return true;
    return false;
  };
  const hasPrimaryOptions = authUI.primaryOptions.some(isOptionAvailable);
  const collapseOtherOptions = hasPrimaryOptions && authUI.otherOptions.length > 0;
  const showSecondaryOptions = !collapseOtherOptions || showOtherOptions;

  // redirect to /login because only that path handle m.login.token
  const ssoRedirectUrl = usePathWithOrigin(getLoginPath(server));

  const renderPasswordRegister = () => (
    <>
      {registerFlows.status === RegisterFlowStatus.RegistrationDisabled && (
        <Text style={{ color: color.Critical.Main }} size="T300">
          Registration has been disabled on this homeserver.
        </Text>
      )}
      {registerFlows.status === RegisterFlowStatus.RateLimited && (
        <Text style={{ color: color.Critical.Main }} size="T300">
          You have been rate-limited! Please try after some time.
        </Text>
      )}
      {registerFlows.status === RegisterFlowStatus.InvalidRequest && (
        <Text style={{ color: color.Critical.Main }} size="T300">
          Invalid Request! Failed to get any registration options.
        </Text>
      )}
      {registerFlows.status === RegisterFlowStatus.FlowRequired && (
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
      )}
    </>
  );

  const renderAuthOption = (option: AuthOption | string) => {
    if (option === 'sso' && sso) {
      return (
        <SSOLogin
          providers={sso.identity_providers}
          redirectUrl={ssoRedirectUrl}
          action={SSOAction.REGISTER}
          saveScreenSpace={false}
        />
      );
    }

    if (option === 'password' && passwordAvailable) {
      return renderPasswordRegister();
    }

    if (option === 'account-switch') {
      return (
        <Text align="Center">
          Already have an account? <Link to={getLoginPath(server)}>Login</Link>
        </Text>
      );
    }

    return null;
  };

  return (
    <Box direction="Column" gap="500">
      <Text size="H2" priority="400">
        Register
      </Text>
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
    </Box>
  );
}
