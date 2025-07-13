import { IdentityProviders } from '@backstage/core-components';
import {
    microsoftAuthApiRef,
} from '@backstage/core-plugin-api';

export const providers: IdentityProviders = [
    {
        id: 'microsoft-auth-provider',
        title: 'Microsoft',
        message: 'Sign In using Microsoft Entra ID',
        apiRef: microsoftAuthApiRef,
    },
    'guest'
];