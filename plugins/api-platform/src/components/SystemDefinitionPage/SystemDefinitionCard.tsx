import {
    InfoCard,
    TabbedLayout,
    Link,
} from '@backstage/core-components';
import { getCompoundEntityRef } from "@backstage/catalog-model";
import { catalogApiRef, EntityProvider, EntityRefLink, useEntity } from '@backstage/plugin-catalog-react';
import { AboutField, } from '@backstage/plugin-catalog';
import { SystemRelationCard } from './SystemPlatformRelationCard';
import { memo, useMemo } from 'react';
import { EntityMembersListCard } from '@backstage/plugin-org';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { ComponentAboutContent } from '../common/ComponentAboutContent';
import { RiFileFill } from '@remixicon/react';
import { Box, Grid, ButtonIcon } from '@backstage/ui';
import styles from './SystemDefinitionCard.module.css';

interface SystemDefinitionCardProps {
    system: string;
    apis: string[];
    services: string[];
}

export const SystemDefinitionCard = memo<SystemDefinitionCardProps>(({ system, apis, services }) => {
    const catalogApi = useApi(catalogApiRef);
    const { entity } = useEntity();
    
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

    // TODO-MUI
    const docsButton = useMemo(() => (
         <ButtonIcon
            icon={<RiFileFill />}
            isDisabled={!entityData.hasDocs}
            size='medium'
            variant='tertiary'
        >
            <Link to={`/docs/${entityData.entityRef.namespace}/${entityData.entityRef.kind}/${entityData.entityRef.name}`} />
        </ButtonIcon>
    ), [entityData.hasDocs, entityData.entityRef]);

    const aboutField = useMemo(() => (
        <Box mb='4'>
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
                <Grid.Root columns='12'>
                    <Grid.Item colSpan='6'>
                        <SystemRelationCard system={system} dependency="service" data={services} />
                    </Grid.Item>
                    <Grid.Item colSpan='6'>
                        <SystemRelationCard system={system} dependency="api" data={apis} />
                    </Grid.Item>
                </Grid.Root>
            </TabbedLayout.Route>

            <TabbedLayout.Route path="/members" title="Members">
                <EntityProvider entity={ownedByGroup.value}>
                    <EntityMembersListCard />
                </EntityProvider>
            </TabbedLayout.Route>

            <TabbedLayout.Route path="/info" title="Info">
                <Grid.Root columns='12'>
                    <Grid.Item colSpan='6'>
                        <InfoCard
                            title="About"
                            divider
                            className={styles.gridItemCard}
                            action={docsButton}
                        >
                            {aboutField}
                            <ComponentAboutContent entity={entity} />
                        </InfoCard>
                    </Grid.Item>
                </Grid.Root>
            </TabbedLayout.Route>

        </TabbedLayout>
    );
});