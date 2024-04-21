import {
    microsoftAuthApiRef,
} from '@backstage/core-plugin-api';

export const providers = [
    {
        id: 'microsoft-auth-provider',
        title: 'Microsoft',
        message: 'Sign In using Microsoft Azure AD',
        apiRef: microsoftAuthApiRef,
    }
];