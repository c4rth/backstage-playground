import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import {
    defaultGroupTransformer,
    defaultUserTransformer,
    defaultOrganizationTransformer,
    // MICROSOFT_GRAPH_GROUP_ID_ANNOTATION,
    normalizeEntityName,
} from '@backstage/plugin-catalog-backend-module-msgraph';
import { GroupEntity, UserEntity } from '@backstage/catalog-model';
import { LoggerService } from '@backstage/backend-plugin-api';


export interface GraphTransformerService {
    groupTransformer(group: MicrosoftGraph.Group, groupPhoto?: string,): Promise<GroupEntity | undefined>;
    userTransformer(graphUser: MicrosoftGraph.User, userPhoto?: string,): Promise<UserEntity | undefined>;
    organizationTransformer(graphOrganization: MicrosoftGraph.Organization,): Promise<GroupEntity | undefined>;
}


export interface GroupTransformerOptions {
    logger: LoggerService;
}

function extractGroupName(group: MicrosoftGraph.Group): string {
    if (group.securityEnabled) {
        return group.displayName as string;
    }
    return (group.mailNickname || group.displayName) as string;
}

export async function createGraphTransformerService(options: GroupTransformerOptions): Promise<GraphTransformerService> {

    const logger = options.logger;
    logger.info('Initializing GraphTransformerService');;

    return {
        async groupTransformer(group: MicrosoftGraph.Group, groupPhoto?: string,): Promise<GroupEntity | undefined> {
            const name = normalizeEntityName(extractGroupName(group)).toLocaleUpperCase();
            logger.debug(`Transforming group: ${name}`, { task: "groupTransformer" });
            if (name.startsWith('TEAM') && !name.endsWith('.R')) {
                const backstageGroup = await defaultGroupTransformer(group, groupPhoto);
                logger.debug(JSON.stringify(backstageGroup), { task: "groupTransformer" });
                if (backstageGroup) {
                    backstageGroup.spec.type = 'Microsoft Entra ID';
                    // backstageGroup.spec.profile!.displayName = `backstage-${group.displayName}`;
                }
                return backstageGroup;
            }
            /*
            const backstageGroup = await defaultGroupTransformer(group, groupPhoto);
            if (backstageGroup) {
                logger.debug(JSON.stringify(group), { task: "groupTransformer" });
                logger.debug(JSON.stringify(backstageGroup), { task: "groupTransformer" });
                if (backstageGroup.metadata.annotations) {
                    logger.debug(backstageGroup.metadata.annotations[MICROSOFT_GRAPH_GROUP_ID_ANNOTATION], { task: "groupTransformer" });
                }

                if (group.displayName?.startsWith('team') && !group.displayName?.endsWith('.R')) {
                    backstageGroup.spec.type = 'Microsoft Entra ID';
                    backstageGroup.spec.profile!.displayName = `backstage-${group.displayName}`;
                    return backstageGroup;

                }
            }
            */
            return undefined;
        },

        async userTransformer(user: MicrosoftGraph.User, userPhoto?: string,): Promise<UserEntity | undefined> {
            if (!user.id || !user.displayName || !user.mail) {
                return undefined;
            }
            const email = normalizeEntityName(user.mail);
            if (email.endsWith('@google.com')) {
                return undefined;
            }
            const backstageUser = await defaultUserTransformer(user, userPhoto);
            if (!backstageUser) {
                return undefined;
            }
            backstageUser.metadata.description = 'Loaded from Microsoft Entra ID';
            if (backstageUser.spec.profile) {
                const name = backstageUser.spec.profile.displayName || user.displayName;
                if (name.includes('Excluded')) {
                    return undefined;
                }
                backstageUser.spec.profile.displayName = name.replace('Abcdefg', '');
            }
            return backstageUser;

            /*
            const backstageUser = await defaultUserTransformer(graphUser, userPhoto);
            logger.debug(JSON.stringify(graphUser), { task: "userTransformer" });
            logger.debug(JSON.stringify(backstageUser), { task: "userTransformer" });

            if (backstageUser) {
                backstageUser.metadata.description = 'Loaded from Microsoft Entra ID';
            }

            return backstageUser;
            */
        },

        async organizationTransformer(graphOrganization: MicrosoftGraph.Organization,): Promise<GroupEntity | undefined> {
            const backstageOrg = await defaultOrganizationTransformer(graphOrganization);
            logger.debug(JSON.stringify(backstageOrg), { task: "organizationTransformer" });
            return backstageOrg;
        }
    };

}