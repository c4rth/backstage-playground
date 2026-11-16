import {
  BackstageUserInfo,
  UserInfoService,
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

function isUserPrincipal(principal: unknown): boolean {
  return (
    typeof principal === 'object' &&
    principal !== null &&
    'type' in principal &&
    principal.type === 'user'
  );
}

class CustomPermissionPolicy implements PermissionPolicy {
  private readonly superUserGroups: string[];
  private readonly customPermissions: Map<string, string[]>;
  private readonly userInfo: UserInfoService;
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

  constructor(config: Config, userInfo: UserInfoService) {
    this.userInfo = userInfo;
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
    userInfo?: BackstageUserInfo,
  ): AuthorizeResult.ALLOW | AuthorizeResult.DENY | undefined {
    const allowed = this.customPermissions.get(permissionName);
    if (!allowed) return undefined;
    const isAllowed =
      userInfo?.ownershipEntityRefs.some(ref => allowed.includes(ref)) ??
      false;
    return isAllowed ? AuthorizeResult.ALLOW : AuthorizeResult.DENY;
  }

  private isSuperUser(userInfo?: BackstageUserInfo): boolean {
    return (
      this.superUserGroups.length !== 0 &&
      (userInfo?.ownershipEntityRefs.some(ref =>
        this.superUserGroups.includes(ref),
      ) ??
        false)
    );
  }

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    const userInfo =
      user && isUserPrincipal(user.credentials.principal)
        ? await this.userInfo.getUserInfo(user.credentials)
        : undefined;
    const custom = this.resolveCustomPermission(
      request.permission.name,
      userInfo,
    );

    if (userInfo?.userEntityRef === 'user:default/guest') {
      if (custom === AuthorizeResult.ALLOW)
        return { result: AuthorizeResult.ALLOW };
      const isRead =
        isPermission(request.permission, catalogEntityReadPermission) &&
        !isPermission(request.permission, notGuestPermission);
      return { result: isRead ? AuthorizeResult.ALLOW : AuthorizeResult.DENY };
    }

    if (this.isSuperUser(userInfo)) {
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
        userInfo: coreServices.userInfo,
      },
      async init({ policy, config, userInfo }) {
        policy.setPolicy(new CustomPermissionPolicy(config, userInfo));
      },
    });
  },
});
