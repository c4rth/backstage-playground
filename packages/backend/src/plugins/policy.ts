import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { LoggerService } from '@backstage/backend-plugin-api';
import { catalogEntityCreatePermission, catalogEntityDeletePermission } from '@backstage/plugin-catalog-common/alpha';
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


export class MyPermissionPolicy implements PermissionPolicy {

  logger: LoggerService;
  config: Config;
  adminGroups: string[] = [];

  constructor(logger: LoggerService, config: Config) {
    this.logger = logger;
    this.config = config;
    this.adminGroups = this.config.getOptionalStringArray('permission.rbac.admin.superUsers') ?? [];
  }

  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    // guest
    if (user?.identity?.userEntityRef === 'user:default/guest') {
      return { result: AuthorizeResult.DENY };
    }
    // catalogEntityCreatePermission
    if (isPermission(request.permission, catalogEntityCreatePermission)) {
      if (this.adminGroups.length === 0 || user?.identity?.ownershipEntityRefs.some((entityRef) => this.adminGroups.includes(entityRef))) {
        return { result: AuthorizeResult.ALLOW };
      }
      return { result: AuthorizeResult.DENY };
    }
    // catalogEntityDeletePermission
    if (isPermission(request.permission, catalogEntityDeletePermission)) {
      if (this.adminGroups.length === 0 || user?.identity?.ownershipEntityRefs.some((entityRef) => this.adminGroups.includes(entityRef))) {
        return { result: AuthorizeResult.ALLOW };
      }
      return { result: AuthorizeResult.DENY };
    }
    return {
      result: AuthorizeResult.ALLOW,
    };
  }
}