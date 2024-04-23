import { getRootLogger } from '@backstage/backend-common';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';

export class MyAllowAllPermissionPolicy implements PermissionPolicy {
  async handle(
    _request: PolicyQuery,
    _user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    const logger = getRootLogger();
    const xxx = JSON.stringify(_request.permission.attributes);
    logger.info("****************************************");
    logger.info(`${_request.permission.name} - ${_request.permission.type} - ${xxx}`, { service: "MyAllowAllPermissionPolicy"});
    logger.info(`${_user?.identity.userEntityRef}`, { service: "MyAllowAllPermissionPolicy"});
    logger.info("****************************************");
    return {
      result: AuthorizeResult.ALLOW,
    };
  }
}