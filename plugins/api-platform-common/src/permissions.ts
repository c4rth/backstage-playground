import {
    createPermission,
  } from '@backstage/plugin-permission-common';

export const toolsReadPermission = createPermission({
    name: 'tools.read',
    attributes: {
      action: 'read',
    },
  });