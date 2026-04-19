import { IdentityProviders } from '@backstage/core-components';
import { microsoftAuthApiRef } from '@backstage/core-plugin-api';

export const providers: IdentityProviders = [
  {
    id: 'microsoft-auth-provider',
    title: 'Authenticated',
    message: 'Sign in using Microsoft Entra ID',
    apiRef: microsoftAuthApiRef,
  },
  'guest',
];
