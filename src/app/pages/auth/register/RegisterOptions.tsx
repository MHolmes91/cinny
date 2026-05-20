import React from 'react';
import { Text, color } from 'folds';
import { Link } from 'react-router-dom';
import { SSOAction } from 'matrix-js-sdk';
import { AuthOption, useClientConfig } from '../../../hooks/useClientConfig';
import { getAuthUI, getBranding } from '../../../config/branding';
import { RegisterFlowsResponse, RegisterFlowStatus } from '../../../hooks/useAuthFlows';
import { ParsedLoginFlows } from '../../../hooks/useParsedLoginFlows';
import { AuthOptions } from '../AuthOptions';
import { PasswordRegisterForm, SUPPORTED_REGISTER_STAGES } from './PasswordRegisterForm';
import { SSOLogin } from '../SSOLogin';
import { SupportedUIAFlowsLoader } from '../../../components/SupportedUIAFlowsLoader';
import { getLoginPath } from '../../pathUtils';
import { RegisterPathSearchParams } from '../../paths';

type RegisterOptionsProps = {
  server: string;
  parsedFlows: ParsedLoginFlows;
  registerFlows: RegisterFlowsResponse;
  registerSearchParams: RegisterPathSearchParams;
  ssoRedirectUrl: string;
};

export function RegisterOptions({
  server,
  parsedFlows,
  registerFlows,
  registerSearchParams,
  ssoRedirectUrl,
}: RegisterOptionsProps) {
  const clientConfig = useClientConfig();
  const branding = getBranding(clientConfig);
  const authUI = getAuthUI(clientConfig);
  const { sso } = parsedFlows;
  const passwordAvailable =
    registerFlows.status === RegisterFlowStatus.RegistrationDisabled ||
    registerFlows.status === RegisterFlowStatus.RateLimited ||
    registerFlows.status === RegisterFlowStatus.InvalidRequest ||
    registerFlows.status === RegisterFlowStatus.FlowRequired;

  const isOptionAvailable = (option: AuthOption): boolean => {
    if (option === 'sso') return sso !== undefined;
    if (option === 'password') return passwordAvailable;
    if (option === 'account-switch') return true;
    return false;
  };

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
      {registerFlows.status === RegisterFlowStatus.FlowRequired && registerFlows.data && (
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
                authData={registerFlows.data!}
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

  const renderAuthOption = (option: AuthOption) => {
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
    <AuthOptions
      primaryOptions={authUI.primaryOptions}
      otherOptions={authUI.otherOptions}
      showOtherLabel={branding.showOtherAuthOptionsLabel}
      isAvailable={isOptionAvailable}
      renderOption={renderAuthOption}
    />
  );
}
