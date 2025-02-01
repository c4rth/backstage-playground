import {
    EmptyState,
    InfoCard,
    TabbedLayout,
} from '@backstage/core-components';
import { ComponentEntity } from "@backstage/catalog-model"
import React from 'react';
import {
    EntityConsumedApisCard,
    EntityProvidedApisCard,
} from '@backstage/plugin-api-docs';
import { Box, Grid, makeStyles, Theme, Typography } from '@material-ui/core';
import { EntityProvider, EntityRefLink } from '@backstage/plugin-catalog-react';
import {
    EntitySwitch,
    EntityOrphanWarning,
    EntityProcessingErrorsPanel,
    hasCatalogProcessingErrors,
    isOrphan,
    hasRelationWarnings,
    EntityRelationWarning,
    AboutField,
    AboutContent,
} from '@backstage/plugin-catalog';
import {
    EntityAzurePipelinesContent,
    isAzureDevOpsAvailable,
    isAzurePipelinesAvailable,
} from '@backstage-community/plugin-azure-devops';

import {
    Direction,
    EntityCatalogGraphCard,
} from '@backstage/plugin-catalog-graph';
import { API_PLATFORM_SERVICE_CONTAINER_VERSION_ANNOTATION, API_PLATFORM_SERVICE_CONTAINER_NAME_ANNOTATION } from '@internal/plugin-api-platform-common';

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

const cicdContent = (
    <EntitySwitch>
        <EntitySwitch.Case if={isAzureDevOpsAvailable}>
            <EntityAzurePipelinesContent defaultLimit={25} />
        </EntitySwitch.Case>
        <EntitySwitch.Case if={isAzurePipelinesAvailable}>
            <EntityAzurePipelinesContent defaultLimit={25} />
        </EntitySwitch.Case>
        <EntitySwitch.Case>
            <EmptyState
                title="No CI/CD available for this service"
                missing="info"
                description="You need to add an annotation to the catalog-info if you want to enable CI/CD for it."
            />
        </EntitySwitch.Case>
    </EntitySwitch>
);

const entityWarningContent = (
    <>
        <EntitySwitch>
            <EntitySwitch.Case if={isOrphan}>
                <Grid item xs={12}>
                    <EntityOrphanWarning />
                </Grid>
            </EntitySwitch.Case>
        </EntitySwitch>

        <EntitySwitch>
            <EntitySwitch.Case if={hasRelationWarnings}>
                <Grid item xs={12}>
                    <EntityRelationWarning />
                </Grid>
            </EntitySwitch.Case>
        </EntitySwitch>

        <EntitySwitch>
            <EntitySwitch.Case if={hasCatalogProcessingErrors}>
                <Grid item xs={12}>
                    <EntityProcessingErrorsPanel />
                </Grid>
            </EntitySwitch.Case>
        </EntitySwitch>
    </>
);

export const ServicePlatformDefinitionCard = (props: { serviceEntity: ComponentEntity }) => {

    const { serviceEntity } = props;

    const classes = useStyles();

    const containerName = serviceEntity.metadata[API_PLATFORM_SERVICE_CONTAINER_NAME_ANNOTATION]?.toString();
    const containerVersion = serviceEntity.metadata[API_PLATFORM_SERVICE_CONTAINER_VERSION_ANNOTATION]?.toString();
    return (
        <EntityProvider entity={props.serviceEntity}>
            <TabbedLayout>
                <TabbedLayout.Route path="/" title="Overview">
                    <Grid container spacing={3} alignItems="stretch">
                        {entityWarningContent}
                        <Grid item md={6}>
                            <InfoCard title='About' divider className={classes.gridItemCard}>
                                <Box sx={{ mb: 4 }}>
                                    <AboutField
                                        label="Service reference"
                                        gridSizes={{ xs: 12 }} >
                                        <EntityRefLink entityRef={serviceEntity!} />
                                    </AboutField>
                                </Box>
                                <Box sx={{ mb: 4 }}>
                                    <AboutField
                                        label="Container"
                                        gridSizes={{ xs: 12 }} >
                                        <div>
                                            <Typography variant='overline' display='inline' className={classes.label}>name:</Typography>
                                            <Box display='inline' mr={1} />
                                            <Typography variant='body2' display='inline' className={classes.value}>{containerName}</Typography>
                                        </div>
                                        <div>
                                            <Typography variant='overline' display='inline' className={classes.label}>version:</Typography>
                                            <Box display='inline' mr={1} />
                                            <Typography variant='body2' display='inline' className={classes.value}>{containerVersion}</Typography>
                                        </div>
                                    </AboutField>
                                </Box>
                                <AboutContent entity={serviceEntity} />
                            </InfoCard>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <EntityCatalogGraphCard variant="gridItem" height={400} kinds={['API']} direction={Direction.TOP_BOTTOM} />
                        </Grid>
                    </Grid>
                </TabbedLayout.Route>
                <TabbedLayout.Route path="/cicd" title="CI/CD">
                    {cicdContent}
                </TabbedLayout.Route>
                <TabbedLayout.Route path="/apis" title="API">
                    <Grid container spacing={3} alignItems="stretch">
                        <Grid item md={6}>
                            <EntityProvidedApisCard />
                        </Grid>
                        <Grid item md={6}>
                            <EntityConsumedApisCard />
                        </Grid>
                    </Grid>
                </TabbedLayout.Route>
                <TabbedLayout.Route path="/appreg" title="App Registry">
                    <Grid container spacing={3} alignItems="stretch">
                        <Grid item md={12}>
                            <Typography variant='h5'><i>Soon...</i></Typography>
                        </Grid>
                    </Grid>
                </TabbedLayout.Route>
            </TabbedLayout>
        </EntityProvider>
    );
}