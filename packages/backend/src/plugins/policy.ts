import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  PolicyDecision,
  //isCreatePermission,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';

export class MyPermissionPolicy implements PermissionPolicy {
  async handle(
    _request: PolicyQuery,
    _user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    // const logger = getRootLogger();
    // const xxx = JSON.stringify(_request.permission.attributes);
    // logger.info("****************************************");
    // logger.info(`${_request.permission.name} - ${_request.permission.type} - ${xxx}`, { service: "MyPermissionPolicy" });
    // logger.info(`${_user?.identity.userEntityRef}`, { service: "MyPermissionPolicy" });
    // logger.info("****************************************");
    //if (isCreatePermission(_request.permission)) {
    //  return {
    //    result: AuthorizeResult.DENY,
    //  };
    //}
    return {
      result: AuthorizeResult.ALLOW,
    };
  }
}