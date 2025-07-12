import {
    InfoCard,
    TabbedLayout,
    Link,
} from '@backstage/core-components';
import { memo, useMemo } from 'react';
import { ComponentEntity, getCompoundEntityRef } from "@backstage/catalog-model";
import { Box, Grid, IconButton, makeStyles, Theme, Typography } from '@material-ui/core';
import { EntityRefLink, useEntity } from '@backstage/plugin-catalog-react';
import {
    AboutField,
    AboutContent,
} from '@backstage/plugin-catalog';
import DocsIcon from '@material-ui/icons/Description';
import {
    Direction,
    EntityCatalogGraphCard,
} from '@backstage/plugin-catalog-graph';
import { ANNOTATION_IMAGE_VERSION, ANNOTATION_SERVICE_PLATFORM } from '@internal/plugin-api-platform-common';
// SonarQube
import { EntitySonarQubeContentPage } from '@backstage-community/plugin-sonarqube';
import { isSonarQubeAvailable } from '@backstage-community/plugin-sonarqube-react';
import { ServicePlatformRelationCard } from './ServicePlatformRelationCard';
// Azure DevOps
import {
    EntityAzurePipelinesCard,
    isAzureDevOpsAvailable,
    isAzurePipelinesAvailable,
} from '@internal/plugin-azure-devops';
// App Registry
import { AppRegistryPage } from '@internal/plugin-app-registry';

const useStyles = makeStyles(
    (theme: Theme) => ({
        gridItemCard: {
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 10px)', // for pages without content header
            marginBottom: '10px',
        },
        infoCardHeader: {
            padding: '16px',
        },
        value: {
            fontWeight: 'bold',
            overflow: 'hidden',
            lineHeight: '24px',
            wordBreak: 'break-word',
        },
        label: {
            color: theme.palette.text.secondary,
            textTransform: 'uppercase',
            fontSize: '10px',
            fontWeight: 'bold',
            letterSpacing: 0.5,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
        },
    }),
);

export const ServicePlatformDefinitionCard = memo(() => {
    const { entity } = useEntity<ComponentEntity>();
    const classes = useStyles();

    const entityData = useMemo(() => {
        const platform = (entity.metadata[ANNOTATION_SERVICE_PLATFORM] || 'cloud').toString();
        const imageVersion = entity.metadata[ANNOTATION_IMAGE_VERSION]?.toString();
        const entityRef = getCompoundEntityRef(entity);
        const hasDocs = Boolean(entity.metadata.annotations?.['backstage.io/techdocs-ref']);
        
        return {
            platform,
            imageVersion,
            entityRef,
            hasDocs,
        };
    }, [entity]);

    const availabilityChecks = useMemo(() => ({
        azureDevOps: isAzureDevOpsAvailable(entity) || isAzurePipelinesAvailable(entity),
        sonarQube: isSonarQubeAvailable(entity),
    }), [entity]);

    const docsButton = useMemo(() => (
        <IconButton
            aria-label="Documentation"
            title="TechDocs"
            disabled={!entityData.hasDocs}
            component={Link}
            to={`/docs/${entityData.entityRef.namespace}/${entityData.entityRef.kind}/${entityData.entityRef.name}`}
        >
            <DocsIcon />
        </IconButton>
    ), [entityData.hasDocs, entityData.entityRef]);

    const aboutFields = useMemo(() => (
        <Box sx={{ mb: 4 }}>
            <Grid container>
                <AboutField
                    label="Service reference"
                    gridSizes={{ xs: 12, sm: 6, lg: 4 }}
                >
                    <EntityRefLink entityRef={entity} />
                </AboutField>
                <AboutField
                    label="Platform"
                    gridSizes={{ xs: 12, sm: 6, lg: 4 }}
                >
                    <Typography variant="body2" display="inline" className={classes.value}>
                        {entityData.platform}
                    </Typography>
                </AboutField>
                <AboutField
                    label="Image version"
                    gridSizes={{ xs: 12, sm: 6, lg: 4 }}
                >
                    <Typography variant="body2" display="inline" className={classes.value}>
                        {entityData.imageVersion || 'N/A'}
                    </Typography>
                </AboutField>
            </Grid>
        </Box>
    ), [entity, entityData.platform, entityData.imageVersion, classes.value]);

    return (
        <TabbedLayout>
            <TabbedLayout.Route path="/" title="Overview">
                <Grid container spacing={3} alignItems="stretch">
                    <Grid item md={6}>
                        <InfoCard 
                            title="About" 
                            divider 
                            className={classes.gridItemCard} 
                            action={docsButton}
                        >
                            {aboutFields}
                            <AboutContent entity={entity} />
                        </InfoCard>
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <EntityCatalogGraphCard 
                            variant="gridItem" 
                            height={400} 
                            kinds={['API']} 
                            direction={Direction.TOP_BOTTOM} 
                            unidirectional 
                        />
                    </Grid>
                </Grid>
            </TabbedLayout.Route>
            
            <TabbedLayout.Route path="/api" title="API">
                <Grid container spacing={3} alignItems="stretch">
                    <Grid item md={6}>
                        <ServicePlatformRelationCard dependency="provided" />
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <ServicePlatformRelationCard dependency="consumed" />
                    </Grid>
                </Grid>
            </TabbedLayout.Route>
            
            <TabbedLayout.Route path="/appreg" title="App Registry">
                <Grid container spacing={3} alignItems="stretch">
                    <Grid item md={12}>
                        <AppRegistryPage />
                    </Grid>
                </Grid>
            </TabbedLayout.Route>
            
            {availabilityChecks.azureDevOps && (
                <TabbedLayout.Route path="/ci-cd" title="CI/CD">
                    <EntityAzurePipelinesCard defaultLimit={10} />
                </TabbedLayout.Route>
            )}
            
            {availabilityChecks.sonarQube && (
                <TabbedLayout.Route path="/sonarqube" title="SonarQube">
                    <EntitySonarQubeContentPage />
                </TabbedLayout.Route>
            )}
        </TabbedLayout>
    );
});