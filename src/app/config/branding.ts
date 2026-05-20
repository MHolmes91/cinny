import { AuthUIConfig, BrandingConfig, ClientConfig } from '../hooks/useClientConfig';

export const defaultBranding = {
  appName: 'My Title',
  deviceName: 'My Title Web',
  logoAlt: 'My Title logo',
  loadingText: 'Loading My Title',
  authDescription: 'Sign in with your organization account to start chatting.',
  welcomeTitle: 'Welcome to My Title',
  welcomeSubtitle: 'A private Matrix client for your community.',
  aboutSubtitle: 'A private Matrix client.',
  sourceCodeLabel: 'Source Code',
  supportLabel: 'Support',
  showOtherAuthOptionsLabel: 'Show other sign-in options',
} satisfies Required<BrandingConfig>;

export const defaultAuthUI = {
  hideHomeserver: true,
  primaryOptions: ['sso'],
  otherOptions: ['password', 'account-switch'],
} satisfies Required<AuthUIConfig>;

export const getBranding = (clientConfig: ClientConfig): Required<BrandingConfig> => ({
  ...defaultBranding,
  ...clientConfig.branding,
});

export const getAuthUI = (clientConfig: ClientConfig): Required<AuthUIConfig> => ({
  hideHomeserver: clientConfig.ui?.auth?.hideHomeserver ?? defaultAuthUI.hideHomeserver,
  primaryOptions: clientConfig.ui?.auth?.primaryOptions ?? defaultAuthUI.primaryOptions,
  otherOptions: clientConfig.ui?.auth?.otherOptions ?? defaultAuthUI.otherOptions,
});
