import {
    InfoCard,
    TabbedLayout,
    Link,
} from '@backstage/core-components';
import { getCompoundEntityRef } from "@backstage/catalog-model";
import React from 'react';
import { Box, Grid, IconButton, makeStyles, Theme } from '@material-ui/core';
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
import { SystemDefinition } from '@internal/plugin-api-platform-common';
import { SystemRelationTableCard } from './SystemRelationTableCard';

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

export const SystemPlatformDefinitionCard = (props: { systemDefinition: SystemDefinition }) => {

    const { systemDefinition } = props;

    const classes = useStyles();

    const entityRef = getCompoundEntityRef(systemDefinition.entity);
    const hasDocs = systemDefinition.entity.metadata.annotations?.['backstage.io/techdocs-ref'];

    return (
        <>
            <EntityProvider entity={systemDefinition.entity}>
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
                                            label="System reference"
                                            gridSizes={{ xs: 12 }} >
                                            <EntityRefLink entityRef={systemDefinition.entity!} />
                                        </AboutField>
                                    </Box>
                                    <AboutContent entity={systemDefinition.entity} />
                                </InfoCard>
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <EntityCatalogGraphCard variant="gridItem" height={400} kinds={['API']} direction={Direction.TOP_BOTTOM} />
                            </Grid>
                        </Grid>
                    </TabbedLayout.Route>
                    <TabbedLayout.Route path="/relations" title="Relations">
                        <Grid container spacing={3} alignItems="stretch">
                            <Grid item md={6}>
                                <SystemRelationTableCard dependency='service' systemDefinition={systemDefinition} />
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <SystemRelationTableCard dependency='api' systemDefinition={systemDefinition} />
                            </Grid>
                        </Grid>
                    </TabbedLayout.Route>
                </TabbedLayout>
            </EntityProvider >
        </>
    );
}