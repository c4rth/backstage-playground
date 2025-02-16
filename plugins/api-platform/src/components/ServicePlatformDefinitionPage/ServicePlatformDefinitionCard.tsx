import {
    InfoCard,
    TabbedLayout,
    Link,
} from '@backstage/core-components';
import { ComponentEntity, getCompoundEntityRef } from "@backstage/catalog-model";
import React from 'react';
import { Box, Grid, IconButton, makeStyles, Theme, Typography } from '@material-ui/core';
import { EntityProvider, EntityRefLink } from '@backstage/plugin-catalog-react';
import {
    AboutField,
    AboutContent,
} from '@backstage/plugin-catalog';
import DocsIcon from '@material-ui/icons/Description';
import {
    Direction,
    EntityCatalogGraphCard,
} from '@backstage/plugin-catalog-graph';
import { ANNOTATION_CONTAINER_VERSION, ANNOTATION_CONTAINER_NAME } from '@internal/plugin-api-platform-common';
// SonarQube
import { EntitySonarQubeCard, EntitySonarQubeContentPage } from '@backstage-community/plugin-sonarqube';
import { isSonarQubeAvailable } from '@backstage-community/plugin-sonarqube-react';
import { ServicePlatformRelationCard } from './ServicePlatformRelationCard';

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

export const ServicePlatformDefinitionCard = (props: { serviceEntity: ComponentEntity }) => {

    const { serviceEntity } = props;

    const classes = useStyles();

    const containerName = serviceEntity.metadata[ANNOTATION_CONTAINER_NAME]?.toString();
    const containerVersion = serviceEntity.metadata[ANNOTATION_CONTAINER_VERSION]?.toString();
    const entityRef = getCompoundEntityRef(serviceEntity);
    const hasDocs = serviceEntity.metadata.annotations?.['backstage.io/techdocs-ref'];

    return (
        <>
            <EntityProvider entity={serviceEntity}>
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
                                <EntityCatalogGraphCard variant="gridItem" height={400} kinds={['API']} direction={Direction.TOP_BOTTOM} unidirectional />
                            </Grid>
                            {isSonarQubeAvailable(serviceEntity) ?
                                <Grid item md={6}>
                                    <EntitySonarQubeCard variant="gridItem" />
                                </Grid>
                                : <div />
                            }
                        </Grid>
                    </TabbedLayout.Route>
                    <TabbedLayout.Route path="/api" title="API">
                        <Grid container spacing={3} alignItems="stretch">
                            <Grid item md={6}>
                                <ServicePlatformRelationCard dependency='provided' serviceEntity={serviceEntity} />
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <ServicePlatformRelationCard dependency='consumed' serviceEntity={serviceEntity} />
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
                    {isSonarQubeAvailable(serviceEntity) ?
                        <TabbedLayout.Route path="/sonarqube" title="SonarQube">
                            <EntitySonarQubeContentPage />
                        </TabbedLayout.Route>
                        : <div />
                    }
                </TabbedLayout>
            </EntityProvider >
        </>
    );
}