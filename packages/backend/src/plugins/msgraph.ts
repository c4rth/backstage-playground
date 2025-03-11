import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import {
    defaultGroupTransformer,
    defaultUserTransformer,
    defaultOrganizationTransformer,
    MICROSOFT_GRAPH_GROUP_ID_ANNOTATION,
} from '@backstage/plugin-catalog-backend-module-msgraph';
import { GroupEntity, UserEntity } from '@backstage/catalog-model';
import { LoggerService } from '@backstage/backend-plugin-api/index';


export interface GraphTransformerService {
    groupTransformer(group: MicrosoftGraph.Group, groupPhoto?: string,): Promise<GroupEntity | undefined>;
    userTransformer(graphUser: MicrosoftGraph.User, userPhoto?: string,): Promise<UserEntity | undefined>;
    organizationTransformer(graphOrganization: MicrosoftGraph.Organization,): Promise<GroupEntity | undefined>;
}


export interface GroupTransformerOptions {
    logger: LoggerService;
}

export async function createGraphTransformerService(options: GroupTransformerOptions): Promise<GraphTransformerService> {

    const logger= options.logger;
    logger.info('Initializing GraphTransformerService');;

    return {
        async groupTransformer(group: MicrosoftGraph.Group, groupPhoto?: string,): Promise<GroupEntity | undefined> {
            const backstageGroup = await defaultGroupTransformer(group, groupPhoto);
            if (backstageGroup) {
                logger.debug(JSON.stringify(group), { task: "groupTransformer" });
                logger.debug(JSON.stringify(backstageGroup), { task: "groupTransformer" });
                if (backstageGroup.metadata.annotations) {
                    logger.debug(backstageGroup.metadata.annotations[MICROSOFT_GRAPH_GROUP_ID_ANNOTATION], { task: "groupTransformer" });
                }

                if (group.displayName?.startsWith('team')) {
                    backstageGroup.spec.type = 'Microsoft Entra ID';
                    backstageGroup.spec.profile!.displayName = `backstage-${group.displayName}`;
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
        },

        async userTransformer(graphUser: MicrosoftGraph.User, userPhoto?: string,): Promise<UserEntity | undefined> {
            const backstageUser = await defaultUserTransformer(graphUser, userPhoto);
            logger.debug(JSON.stringify(graphUser), { task: "userTransformer" });
            logger.debug(JSON.stringify(backstageUser), { task: "userTransformer" });

            if (backstageUser) {
                backstageUser.metadata.description = 'Loaded from Microsoft Entra ID';
            }

            return backstageUser;
        },

        async organizationTransformer(graphOrganization: MicrosoftGraph.Organization,): Promise<GroupEntity | undefined> {
            const backstageOrg = await defaultOrganizationTransformer(graphOrganization);
            logger.debug(JSON.stringify(backstageOrg), { task: "organizationTransformer" });
            return backstageOrg;
        }
    };

}