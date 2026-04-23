import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { LoggerService } from '@backstage/backend-plugin-api';
import {
  catalogEntityCreatePermission,
  catalogEntityDeletePermission,
  catalogEntityReadPermission,
} from '@backstage/plugin-catalog-common/alpha';
import {
  AuthorizeResult,
  PolicyDecision,
  isPermission,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';
import { Config } from '@backstage/config';
import {
  adminToolsPermission,
  healthDashboardPermission,
  notGuestPermission,
} from '@internal/plugin-permissions-common';
import { devToolsAdministerPermission } from '@backstage/plugin-devtools-common';
import { templateManagementPermission } from '@backstage/plugin-scaffolder-common/alpha';

type CustomPermission = {
  name: string;
  allowed: string[];
};

export class MyPermissionPolicy implements PermissionPolicy {
  logger: LoggerService;
  config: Config;
  superUserGroups: string[] = [];
  permissions: CustomPermission[] = [];

  constructor(logger: LoggerService, config: Config) {
    this.logger = logger;
    this.config = config;
    this.superUserGroups =
      this.config.getOptionalStringArray('permission.rbac.admin.superUsers') ??
      [];
    this.permissions =
      this.config
        .getOptionalConfigArray('permission.rbac.permissions')
        ?.map(cfg => ({
          name: cfg.getString('name'),
          allowed: cfg.getStringArray('allowed'),
        })) ?? [];
  }

  checkCustomPermission(
    permissionName: string,
    user?: BackstageIdentityResponse,
  ): boolean {
    const customPermission = this.permissions.find(
      perm => perm.name === permissionName,
    );
    if (customPermission) {
      return (
        user?.identity?.ownershipEntityRefs.some(entityRef =>
          customPermission.allowed.includes(entityRef),
        ) ?? false
      );
    }
    return false;
  }

  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    // Guest: allow only catalog.read, deny all others
    if (user?.identity?.userEntityRef === 'user:default/guest') {
      const customPermission = this.permissions.find(
        perm => perm.name === request.permission.name,
      );
      if (customPermission) {
        const allowed = this.checkCustomPermission(
          request.permission.name,
          user,
        );
        if (allowed) {
          return {
            result: AuthorizeResult.ALLOW,
          };
        }
      }
      return {
            result: AuthorizeResult.ALLOW,
          };
    }

    // SuperUsers: allow all if in adminGroups
    const isSuperUser =
      this.superUserGroups.length !== 0 &&
      user?.identity?.ownershipEntityRefs.some(entityRef =>
        this.superUserGroups.includes(entityRef),
      );
    if (isSuperUser) {
      return { result: AuthorizeResult.ALLOW };
    }

    // Check custom permissions from config
    const customPermission = this.permissions.find(
      perm => perm.name === request.permission.name,
    );
    if (customPermission) {
      const allowed = this.checkCustomPermission(request.permission.name, user);
      return {
        result: allowed ? AuthorizeResult.ALLOW : AuthorizeResult.DENY,
      };
    }

    // Deny list for regular users
    const denyPermissions = [
      catalogEntityCreatePermission,
      catalogEntityDeletePermission,
      adminToolsPermission,
      devToolsAdministerPermission,
      templateManagementPermission,
      healthDashboardPermission,
    ];
    if (denyPermissions.some(perm => isPermission(request.permission, perm))) {
      return { result: AuthorizeResult.DENY };
    }

    // Allow all other permissions
    return { result: AuthorizeResult.ALLOW };
  }
}
