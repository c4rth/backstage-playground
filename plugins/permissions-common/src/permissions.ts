import {
    createPermission,
  } from '@backstage/plugin-permission-common';

export const adminToolsPermission = createPermission({
    name: 'adminTools.read',
    attributes: {
      action: 'read',
    },
  });

export const notGuestPermission = createPermission({
    name: 'notGuest.read',
    attributes: {
      action: 'read',
    },
  });

export const advancedUserPermission = createPermission({
    name: 'advanced.read',
    attributes: {
      action: 'read',
    },
  });