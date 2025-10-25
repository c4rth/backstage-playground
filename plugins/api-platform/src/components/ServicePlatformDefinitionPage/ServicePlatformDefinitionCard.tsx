import {
    InfoCard,
    TabbedLayout,
    Link,
} from '@backstage/core-components';
import { memo, useMemo } from 'react';
import { ComponentEntity, getCompoundEntityRef } from "@backstage/catalog-model";
import { EntityRefLink, useEntity } from '@backstage/plugin-catalog-react';
import {
    AboutField,
} from '@backstage/plugin-catalog';
import {
    Direction,
    EntityCatalogGraphCard,
} from '@backstage/plugin-catalog-graph';
import { ANNOTATION_IMAGE_VERSION, ANNOTATION_SERVICE_PLATFORM } from '@internal/plugin-api-platform-common';
// SonarQube
import { EntitySonarQubeContentPage } from '@backstage-community/plugin-sonarqube';
import { isSonarQubeAvailable } from '@backstage-community/plugin-sonarqube-react';
// Api Platform
import { ServicePlatformRelationCard } from './ServicePlatformRelationCard';
import { ComponentDisplayName } from '../common';
// App Registry
import { AppRegistryPage } from '@internal/plugin-app-registry';
import { ComponentAboutContent } from '../common/ComponentAboutContent';
// Azure DevOps
import { AzureDevOpsPipelinePage, AzureDevOpsGitTagsPage } from '@internal/plugin-azure-devops';
//
import { getAnnotationValuesFromEntity } from '@backstage-community/plugin-azure-devops-common';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { Grid, Box, Text, ButtonIcon } from '@backstage/ui';
import { RiFileFill } from '@remixicon/react';

// TODO-MUI
import { makeStyles } from '@material-ui/core';


const useStyles = makeStyles(
    () => ({
        gridItemCard: {
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 10px)', // for pages without content header
            marginBottom: '10px',
        },
    }),
);

export const ServicePlatformDefinitionCard = memo(() => {
    const { entity } = useEntity<ComponentEntity>();
    const classes = useStyles();
    const configApi = useApi(configApiRef);

    const entityData = useMemo(() => {
        const platform = (entity.metadata[ANNOTATION_SERVICE_PLATFORM] || 'cloud').toString();
        const imageVersion = entity.metadata[ANNOTATION_IMAGE_VERSION]?.toString();
        const entityRef = getCompoundEntityRef(entity);
        const hasDocs = Boolean(entity.metadata.annotations?.['backstage.io/techdocs-ref']);
        const { project, repo } = getAnnotationValuesFromEntity(entity);
        const lifecycle = entity.spec.lifecycle;
        const repositoryUrl = `https://${configApi.getString('azureDevOps.host')}/${configApi.getString('azureDevOps.organization')}/${project}/_git/${repo}?version=GT${lifecycle}`;
        const repository = `${project}/${repo}`;

        return {
            platform,
            imageVersion,
            entityRef,
            hasDocs,
            repositoryUrl,
            repository,
        };
    }, [entity, configApi]);

    const availabilityChecks = useMemo(() => ({
        sonarQube: isSonarQubeAvailable(entity),
    }), [entity]);

    /*
    <IconButton
                aria-label="Documentation"
                title="TechDocs"
                disabled={!entityData.hasDocs}
                component={Link}
                to={`/docs/${entityData.entityRef.namespace}/${entityData.entityRef.kind}/${entityData.entityRef.name}`}
            >
                <DocsIcon />
            </IconButton>*/

    // TODO-MUI
    const docsButton = useMemo(() => (
        <Link to={`/docs/${entityData.entityRef.namespace}/${entityData.entityRef.kind}/${entityData.entityRef.name}`}>
            <ButtonIcon
                icon={<RiFileFill />}
                isDisabled={!entityData.hasDocs}
                size='medium'
                variant='tertiary'
            />
        </Link>
    ), [entityData.hasDocs, entityData.entityRef]);

    const aboutFields = useMemo(() => (
        <Box>
            <Grid.Root columns='12'>
                <Grid.Item colSpan='4'>
                    <AboutField
                        label="Service reference">
                        <EntityRefLink entityRef={entity} />
                    </AboutField>
                </Grid.Item>

                <Grid.Item colSpan='4'>
                    <AboutField
                        label="Platform">
                        <Text variant='body-medium'>
                            {entityData.platform}
                        </Text>
                    </AboutField>
                </Grid.Item>

                <Grid.Item colSpan='4'>
                    <AboutField
                        label="Image version">
                        <Text variant='body-medium'>
                            {entityData.imageVersion || 'N/A'}
                        </Text>
                    </AboutField>
                </Grid.Item>

                <Grid.Item colSpan='12'>
                    <AboutField
                        label="Repository">
                        {entityData.repository ? (
                            <Link to={entityData.repositoryUrl}>
                                <ComponentDisplayName text={entityData.repository} type='azdo' />
                            </Link>
                        ) : (
                            <Text variant='body-medium'>
                                -
                            </Text>
                        )}
                    </AboutField>
                </Grid.Item>
            </Grid.Root>
        </Box>
    ), [entity, entityData]);

    return (
        <TabbedLayout>
            <TabbedLayout.Route path="/" title="Overview">
                <Grid.Root columns='12'>
                    <Grid.Item colSpan='6'>
                        <InfoCard
                            title="About"
                            divider
                            className={classes.gridItemCard}
                            action={docsButton}>
                            {aboutFields}
                            <Box mt='6' />
                            <ComponentAboutContent entity={entity} />
                        </InfoCard>
                    </Grid.Item>
                    <Grid.Item colSpan='6'>
                        <EntityCatalogGraphCard
                            variant="gridItem"
                            height={400}
                            kinds={['API']}
                            direction={Direction.TOP_BOTTOM}
                            unidirectional
                        />
                    </Grid.Item>
                </Grid.Root>
            </TabbedLayout.Route>

            <TabbedLayout.Route path="/api" title="API">
                <Grid.Root columns='12'>
                    <Grid.Item colSpan='6'>
                        <ServicePlatformRelationCard dependency="provided" />
                    </Grid.Item>
                    <Grid.Item colSpan='6'>
                        <ServicePlatformRelationCard dependency="consumed" />
                    </Grid.Item>
                </Grid.Root>
            </TabbedLayout.Route>

            <TabbedLayout.Route path="/appreg" title="App Registry">
                <AppRegistryPage />
            </TabbedLayout.Route>
            
            <TabbedLayout.Route path="/ci-cd" title="CI/CD">
                <AzureDevOpsPipelinePage />
            </TabbedLayout.Route>

            <TabbedLayout.Route path="/gittags" title="Git Tags">
                <AzureDevOpsGitTagsPage />
            </TabbedLayout.Route>

            {
                availabilityChecks.sonarQube && (
                    <TabbedLayout.Route path="/sonarqube" title="SonarQube">
                        <EntitySonarQubeContentPage />
                    </TabbedLayout.Route>
                )
            }
        </TabbedLayout >
    );
});