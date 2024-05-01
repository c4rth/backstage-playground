import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import {
    defaultGroupTransformer,
    defaultUserTransformer,
    defaultOrganizationTransformer,
    MICROSOFT_GRAPH_GROUP_ID_ANNOTATION,
} from '@backstage/plugin-catalog-backend-module-msgraph';
import { GroupEntity, UserEntity } from '@backstage/catalog-model';
import { getRootLogger } from '@backstage/backend-common';


// This group transformer completely replaces the built in logic with custom logic.
export async function myGroupTransformer(
    group: MicrosoftGraph.Group,
    groupPhoto?: string,
): Promise<GroupEntity | undefined> {

    const backstageGroup = await defaultGroupTransformer(group, groupPhoto);
    if (backstageGroup) {
        const logger = getRootLogger();
        logger.info(JSON.stringify(group), { service: "myGroupTransformer" });
        logger.info(JSON.stringify(backstageGroup), { service: "myGroupTransformer" });
        if (backstageGroup.metadata.annotations) {
            logger.info(backstageGroup.metadata.annotations[MICROSOFT_GRAPH_GROUP_ID_ANNOTATION], { service: "myGroupTransformer" });
        }

        if (group.displayName?.startsWith('team')) {
            backstageGroup.spec.type = 'Microsoft Entra ID';
            backstageGroup.spec.profile!.displayName = 'backstage-' + group.displayName;
            return backstageGroup;

        }
    }

    // if (group.displayName?.startsWith("ENV")) {
    //     logger.info(`skip ${group.displayName}`, { service: "myGroupTransformer"});
    //     return undefined;
    // }

    //  if (backstageGroup) {
    //      backstageGroup.spec.type = 'Microsoft Entra ID';
    //  }

    // return backstageGroup;
    return undefined;
}

// This user transformer makes use of the built in logic, but also sets the description field
export async function myUserTransformer(
    graphUser: MicrosoftGraph.User,
    userPhoto?: string,
): Promise<UserEntity | undefined> {
    const backstageUser = await defaultUserTransformer(graphUser, userPhoto);
    const logger = getRootLogger();
    logger.info(JSON.stringify(graphUser), { service: "myUserTransformer" });
    logger.info(JSON.stringify(backstageUser), { service: "myUserTransformer" });

    if (backstageUser) {
        backstageUser.metadata.description = 'Loaded from Microsoft Entra ID';
    }

    return backstageUser;
}

// Example organization transformer
export async function myOrganizationTransformer(
    graphOrganization: MicrosoftGraph.Organization,
): Promise<GroupEntity | undefined> {
    const backstageOrg = await defaultOrganizationTransformer(graphOrganization);
    const logger = getRootLogger();
    logger.info(JSON.stringify(backstageOrg), { service: "myOrganizationTransformer" });
    return backstageOrg;
}