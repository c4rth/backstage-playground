import {
    InfoCard,
    TabbedLayout,
    Link,
} from '@backstage/core-components';
import { getCompoundEntityRef } from "@backstage/catalog-model";
import { Box, Grid, IconButton, makeStyles, Theme } from '@material-ui/core';
import { catalogApiRef, EntityProvider, EntityRefLink, useEntity } from '@backstage/plugin-catalog-react';
import { AboutField, } from '@backstage/plugin-catalog';
import { SystemPlatformRelationCard } from './SystemPlatformRelationCard';
import { memo, useMemo } from 'react';
import { EntityMembersListCard } from '@backstage/plugin-org';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { ComponentAboutContent } from '../common/ComponentAboutContent';
import { RiFileFill } from '@remixicon/react';

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

interface SystemPlatformDefinitionCardProps {
    system: string;
    apis: string[];
    services: string[];
}

export const SystemPlatformDefinitionCard = memo<SystemPlatformDefinitionCardProps>(({ system, apis, services }) => {
    const catalogApi = useApi(catalogApiRef);
    const { entity } = useEntity();
    const classes = useStyles();

    const entityData = useMemo(() => {
        const entityRef = getCompoundEntityRef(entity);
        const hasDocs = Boolean(entity.metadata.annotations?.['backstage.io/techdocs-ref']);

        return {
            entityRef,
            hasDocs,
        };
    }, [entity]);

    const ownedByGroup = useAsync(async () => {
        const ownedBy = entity.relations?.find(
            rel => rel.type === 'ownedBy' && rel.targetRef.toLowerCase().startsWith('group')
        );
        if (ownedBy) {
            return await catalogApi.getEntityByRef(ownedBy.targetRef);
        }
        return undefined;
    }, [entity, catalogApi]);

    const docsButton = useMemo(() => (
        <IconButton
            aria-label="Documentation"
            title="TechDocs"
            disabled={!entityData.hasDocs}
            component={Link}
            to={`/docs/${entityData.entityRef.namespace}/${entityData.entityRef.kind}/${entityData.entityRef.name}`}
        >
            <RiFileFill />
        </IconButton>
    ), [entityData.hasDocs, entityData.entityRef]);

    const aboutField = useMemo(() => (
        <Box sx={{ mb: 4 }}>
            <AboutField
                label="System reference"
                gridSizes={{ xs: 12 }}
            >
                <EntityRefLink entityRef={entity} />
            </AboutField>
        </Box>
    ), [entity]);

    return (
        <TabbedLayout>
            <TabbedLayout.Route path="/" title="Ownership">
                <Grid container spacing={3} alignItems="stretch">
                    <Grid item md={6}>
                        <SystemPlatformRelationCard system={system} dependency="service" data={services} />
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <SystemPlatformRelationCard system={system} dependency="api" data={apis} />
                    </Grid>
                </Grid>
            </TabbedLayout.Route>

            <TabbedLayout.Route path="/members" title="Members">
                <EntityProvider entity={ownedByGroup.value}>
                    <EntityMembersListCard />
                </EntityProvider>
            </TabbedLayout.Route>

            <TabbedLayout.Route path="/info" title="Info">
                <Grid container spacing={3} alignItems="stretch">
                    <Grid item md={6}>
                        <InfoCard
                            title="About"
                            divider
                            className={classes.gridItemCard}
                            action={docsButton}
                        >
                            {aboutField}
                            <ComponentAboutContent entity={entity} />
                        </InfoCard>
                    </Grid>
                </Grid>
            </TabbedLayout.Route>

        </TabbedLayout>
    );
});