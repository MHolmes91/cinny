import { createContext, useContext } from 'react';

export type HashRouterConfig = {
  enabled?: boolean;
  basename?: string;
};

export type BrandingConfig = {
  appName?: string;
  deviceName?: string;
  logoAlt?: string;
  loadingText?: string;
  authDescription?: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  aboutSubtitle?: string;
  sourceCodeLabel?: string;
  supportLabel?: string;
  showOtherAuthOptionsLabel?: string;
};

export type AuthOption = 'token' | 'sso' | 'password' | 'account-switch';

export type AuthUIConfig = {
  hideHomeserver?: boolean;
  primaryOptions?: AuthOption[];
  otherOptions?: AuthOption[];
};

export type ClientConfig = {
  defaultHomeserver?: number;
  homeserverList?: string[];
  allowCustomHomeservers?: boolean;

  featuredCommunities?: {
    openAsDefault?: boolean;
    spaces?: string[];
    rooms?: string[];
    servers?: string[];
  };

  hashRouter?: HashRouterConfig;
  branding?: BrandingConfig;
  ui?: {
    auth?: AuthUIConfig;
  };
};

const ClientConfigContext = createContext<ClientConfig | null>(null);

export const ClientConfigProvider = ClientConfigContext.Provider;

export function useClientConfig(): ClientConfig {
  const config = useContext(ClientConfigContext);
  if (!config) throw new Error('Client config are not provided!');
  return config;
}

export const clientDefaultServer = (clientConfig: ClientConfig): string =>
  clientConfig.homeserverList?.[clientConfig.defaultHomeserver ?? 0] ?? 'matrix.org';

export const clientAllowedServer = (clientConfig: ClientConfig, server: string): boolean => {
  const { homeserverList, allowCustomHomeservers } = clientConfig;

  if (allowCustomHomeservers) return true;

  return homeserverList?.includes(server) === true;
};
