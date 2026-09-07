import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import {
  catalogEntityCreatePermission,
  catalogEntityDeletePermission,
  catalogEntityReadPermission,
  catalogLocationDeletePermission,
} from '@backstage/plugin-catalog-common/alpha';
import {
  AuthorizeResult,
  PolicyDecision,
  isPermission,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { Config } from '@backstage/config';
import {
  adminToolsPermission,
  notGuestPermission,
} from '@internal/plugin-permissions-common';
import {
  devToolsAdministerPermission,
  devToolsConfigReadPermission,
  devToolsExternalDependenciesReadPermission,
  devToolsInfoReadPermission,
} from '@backstage/plugin-devtools-common';
import { templateManagementPermission } from '@backstage/plugin-scaffolder-common/alpha';
import {
  devToolsTaskSchedulerCreatePermission,
  devToolsTaskSchedulerReadPermission,
} from '@backstage/plugin-devtools-common/alpha';
import {
  unprocessedEntitiesDeletePermission,
  unprocessedEntitiesReadPermission,
} from '@backstage/plugin-catalog-unprocessed-entities-common';

class CustomPermissionPolicy implements PermissionPolicy {
  private readonly superUserGroups: string[];
  private readonly customPermissions: Map<string, string[]>;
  private static readonly DENY_PERMISSIONS = [
    catalogEntityCreatePermission,
    catalogEntityDeletePermission,
    catalogLocationDeletePermission,
    unprocessedEntitiesReadPermission,
    unprocessedEntitiesDeletePermission,
    adminToolsPermission,
    devToolsAdministerPermission,
    devToolsInfoReadPermission,
    devToolsConfigReadPermission,
    devToolsExternalDependenciesReadPermission,
    devToolsTaskSchedulerReadPermission,
    devToolsTaskSchedulerCreatePermission,
    templateManagementPermission,
  ];

  constructor(config: Config) {
    this.superUserGroups =
      config.getOptionalStringArray('permission.rbac.admin.superUsers') ?? [];
    this.customPermissions = new Map(
      (config.getOptionalConfigArray('permission.rbac.permissions') ?? []).map(
        cfg => [cfg.getString('name'), cfg.getStringArray('allowed')],
      ),
    );
  }

  // Returns undefined if there's no custom rule for this permission.
  private resolveCustomPermission(
    permissionName: string,
    user?: PolicyQueryUser,
  ): AuthorizeResult.ALLOW | AuthorizeResult.DENY | undefined {
    const allowed = this.customPermissions.get(permissionName);
    if (!allowed) return undefined;
    const isAllowed =
      user?.info?.ownershipEntityRefs.some(ref => allowed.includes(ref)) ??
      false;
    return isAllowed ? AuthorizeResult.ALLOW : AuthorizeResult.DENY;
  }

  private isSuperUser(user?: PolicyQueryUser): boolean {
    return (
      this.superUserGroups.length !== 0 &&
      (user?.info?.ownershipEntityRefs.some(ref =>
        this.superUserGroups.includes(ref),
      ) ??
        false)
    );
  }

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    const custom = this.resolveCustomPermission(request.permission.name, user);
    
    if (user?.info?.userEntityRef === 'user:default/guest') {
      if (custom === AuthorizeResult.ALLOW) return { result: AuthorizeResult.ALLOW };
      const isRead =
        isPermission(request.permission, catalogEntityReadPermission) &&
        !isPermission(request.permission, notGuestPermission);
      return { result: isRead ? AuthorizeResult.ALLOW : AuthorizeResult.DENY };
    }

    if (this.isSuperUser(user)) {
      return { result: AuthorizeResult.ALLOW };
    }

    if (custom) {
      return { result: custom };
    }

    const isDenied = CustomPermissionPolicy.DENY_PERMISSIONS.some(perm =>
      isPermission(request.permission, perm),
    );
    return { result: isDenied ? AuthorizeResult.DENY : AuthorizeResult.ALLOW };
  }
}

export const customPermissionPolicyModule = createBackendModule({
  pluginId: 'permission',
  moduleId: 'custom-policy',
  register(reg) {
    reg.registerInit({
      deps: {
        policy: policyExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ policy, config }) {
        policy.setPolicy(new CustomPermissionPolicy(config));
      },
    });
  },
});
