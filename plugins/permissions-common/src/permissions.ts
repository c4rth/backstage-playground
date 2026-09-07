import { createPermission } from '@backstage/plugin-permission-common';

export const adminToolsPermission = createPermission({
  name: 'adminTools.read',
  attributes: {
    action: 'read',
  },
});

export const notGuestPermission = createPermission({
  name: 'app.notGuest',
  attributes: {},
});

export const advancedUserPermission = createPermission({
  name: 'advancedUser.read',
  attributes: {
    action: 'read',
  },
});
