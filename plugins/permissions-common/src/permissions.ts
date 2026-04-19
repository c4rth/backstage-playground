import { createPermission } from '@backstage/plugin-permission-common';

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

export const healthDashboardPermission = createPermission({
  name: 'healthDashboard.read',
  attributes: {
    action: 'read',
  },
});
