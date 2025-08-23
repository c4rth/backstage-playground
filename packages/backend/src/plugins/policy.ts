import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { LoggerService } from '@backstage/backend-plugin-api';
import { catalogEntityCreatePermission, catalogEntityDeletePermission, catalogEntityReadPermission } from '@backstage/plugin-catalog-common/alpha';
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
import { adminToolsPermission } from '@internal/plugin-permissions-common';
import { devToolsAdministerPermission } from '@backstage/plugin-devtools-common';
import { templateManagementPermission } from '@backstage/plugin-scaffolder-common/alpha';


export class MyPermissionPolicy implements PermissionPolicy {

  logger: LoggerService;
  config: Config;
  superUserGroups: string[] = [];

  constructor(logger: LoggerService, config: Config) {
    this.logger = logger;
    this.config = config;
    this.superUserGroups = this.config.getOptionalStringArray('permission.rbac.admin.superUsers') ?? [];
  }

  // guest: allow catalog.read, deny others
  // superUsers groups: allow all
  // others: deny catalog.create + catalog.delete, allow others

  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    // Guest: allow only catalog.read, deny all others
    if (user?.identity?.userEntityRef === 'user:default/guest') {
      return {
        result: isPermission(request.permission, catalogEntityReadPermission)
          ? AuthorizeResult.ALLOW
          : AuthorizeResult.DENY,
      };
    }
    
    // SuperUsers: allow all if in adminGroups
    const isSuperUser =
      this.superUserGroups.length !== 0 &&
      user?.identity?.ownershipEntityRefs.some(entityRef => this.superUserGroups.includes(entityRef));
    if (isSuperUser) {
      return { result: AuthorizeResult.ALLOW };
    }

    // Deny list for regular users
    const denyPermissions = [
      catalogEntityCreatePermission,
      catalogEntityDeletePermission,
      adminToolsPermission,
      devToolsAdministerPermission,
      templateManagementPermission,
    ];
    if (denyPermissions.some(perm => isPermission(request.permission, perm))) {
      return { result: AuthorizeResult.DENY };
    }

    // Allow all other permissions
    return { result: AuthorizeResult.ALLOW };
  }
}