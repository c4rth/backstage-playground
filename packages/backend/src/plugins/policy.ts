import { getRootLogger } from '@backstage/backend-common';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { qetaCreateQuestionPermission, qetaCreateAnswerPermission } from '@drodil/backstage-plugin-qeta-common';
import {
  AuthorizeResult,
  PolicyDecision,
  isPermission,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';

export class MyPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    if (user?.identity?.userEntityRef === 'user:default/guest') {
      if (isPermission(request.permission, catalogEntityCreatePermission) || isPermission(request.permission, qetaCreateQuestionPermission) || isPermission(request.permission, qetaCreateAnswerPermission)) {
        const logger = getRootLogger();
        const xxx = JSON.stringify(request.permission.attributes);
        logger.info("****************************************");
        logger.info(`${request.permission.name} - ${request.permission.type} - ${xxx}`, { service: "MyPermissionPolicy" });
        logger.info(`${user?.identity.userEntityRef}`, { service: "MyPermissionPolicy" });
        logger.info("****************************************");
        return { result: AuthorizeResult.DENY };
      }
    }
    return {
      result: AuthorizeResult.ALLOW,
    };
  }
}