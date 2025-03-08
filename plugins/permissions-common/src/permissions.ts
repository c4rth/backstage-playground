import {
    createPermission,
  } from '@backstage/plugin-permission-common';

export const adminToolsPermission = createPermission({
    name: 'adminTools.read',
    attributes: {
      action: 'read',
    },
  });