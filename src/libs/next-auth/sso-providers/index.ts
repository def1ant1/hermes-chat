import { HERMES_OAUTH_BRAND_KEY } from '@/const/app';

import Auth0 from './auth0';
import Authelia from './authelia';
import Authentik from './authentik';
import AzureAD from './azure-ad';
import Casdoor from './casdoor';
import CloudflareZeroTrust from './cloudflare-zero-trust';
import Cognito from './cognito';
import GenericOIDC from './generic-oidc';
import Github from './github';
import Google from './google';
import Keycloak from './keycloak';
import Logto from './logto';
import MicrosoftEntraID from './microsoft-entra-id';
import Okta from './okta';
import WeChat from './wechat';
import Zitadel from './zitadel';

const rawProviders = [
  Auth0,
  Authentik,
  AzureAD,
  GenericOIDC,
  Github,
  Zitadel,
  Authelia,
  Logto,
  CloudflareZeroTrust,
  Casdoor,
  MicrosoftEntraID,
  WeChat,
  Keycloak,
  Google,
  Cognito,
  Okta,
] as const;

export const ssoProviders = rawProviders.map((descriptor) => ({
  ...descriptor,
  brand: HERMES_OAUTH_BRAND_KEY,
}));
