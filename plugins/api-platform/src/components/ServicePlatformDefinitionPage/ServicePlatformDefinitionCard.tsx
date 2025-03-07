import {
    InfoCard,
    TabbedLayout,
    Link,
} from '@backstage/core-components';
import { ComponentEntity, getCompoundEntityRef } from "@backstage/catalog-model";
import React from 'react';
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

export const ServicePlatformDefinitionCard = () => {

    const { entity } = useEntity<ComponentEntity>();

    const classes = useStyles();

    const platform = (entity.metadata[ANNOTATION_SERVICE_PLATFORM] || 'azure').toString();
    const imageVersion = entity.metadata[ANNOTATION_IMAGE_VERSION]?.toString();
    const entityRef = getCompoundEntityRef(entity);
    const hasDocs = entity.metadata.annotations?.['backstage.io/techdocs-ref'];

    return (
        <TabbedLayout>
            <TabbedLayout.Route path="/" title="Overview">
                <Grid container spacing={3} alignItems="stretch">
                    <Grid item md={6}>
                        <InfoCard title='About' divider className={classes.gridItemCard} action={
                            <>
                                <IconButton
                                    aria-label="Documentation"
                                    title="TechDocs"
                                    disabled={!hasDocs}
                                    component={Link}
                                    to={`/docs/${entityRef.namespace}/${entityRef.kind}/${entityRef.name}`}
                                >
                                    <DocsIcon />
                                </IconButton>
                            </>
                        }>
                            <Box sx={{ mb: 4 }}>
                                <Grid container>
                                    <AboutField
                                        label="Service reference"
                                        gridSizes={{ xs: 12, sm: 6, lg: 4 }} >
                                        <EntityRefLink entityRef={entity!} />
                                    </AboutField>
                                    <AboutField
                                        label="Platform"
                                        gridSizes={{ xs: 12, sm: 6, lg: 4 }} >
                                        <div>
                                            <Typography variant='body2' display='inline' className={classes.value}>{platform}</Typography>
                                        </div>
                                    </AboutField>
                                    <AboutField
                                        label="Image version"
                                        gridSizes={{ xs: 12, sm: 6, lg: 4 }} >
                                        <div>
                                            <Typography variant='body2' display='inline' className={classes.value}>{imageVersion}</Typography>
                                        </div>
                                    </AboutField>
                                </Grid>
                            </Box>
                            <AboutContent entity={entity} />
                        </InfoCard>
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <EntityCatalogGraphCard variant="gridItem" height={400} kinds={['API']} direction={Direction.TOP_BOTTOM} unidirectional />
                    </Grid>
                </Grid>
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/api" title="API">
                <Grid container spacing={3} alignItems="stretch">
                    <Grid item md={6}>
                        <ServicePlatformRelationCard dependency='provided' />
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <ServicePlatformRelationCard dependency='consumed' />
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
            {isAzureDevOpsAvailable(entity) || isAzurePipelinesAvailable(entity) ?
                <TabbedLayout.Route path="/ci-cd" title="CI/CD">
                    <EntityAzurePipelinesCard defaultLimit={10} />
                </TabbedLayout.Route>
                : null
            }
            {isSonarQubeAvailable(entity) ?
                <TabbedLayout.Route path="/sonarqube" title="SonarQube">
                    <EntitySonarQubeContentPage />
                </TabbedLayout.Route>
                : null
            }
        </TabbedLayout>
    );
}