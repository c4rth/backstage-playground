import { InfoCard, TabbedLayout } from '@backstage/core-components';
import { getCompoundEntityRef } from '@backstage/catalog-model';
import {
  catalogApiRef,
  EntityProvider,
  EntityRefLink,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { AboutField } from '@backstage/plugin-catalog';
import { SystemRelationCard } from './SystemPlatformRelationCard';
import { EntityMembersListCard } from '@backstage/plugin-org';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { ComponentAboutContent } from '../common/ComponentAboutContent';
import { RiFileFill } from '@remixicon/react';
import { Box, Grid, Flex, ButtonLink } from '@backstage/ui';
import styles from './SystemDefinitionCard.module.css';
import { SystemDefinition } from '@internal/plugin-api-platform-common';

interface SystemDefinitionCardProps {
  system: string;
  systemDefinition: SystemDefinition;
}

export const SystemDefinitionCard = ({
  system,
  systemDefinition,
}: SystemDefinitionCardProps) => {
  const catalogApi = useApi(catalogApiRef);
  const { entity } = useEntity();

  const entityRef = getCompoundEntityRef(entity);
  const hasDocs = Boolean(
    entity.metadata.annotations?.['backstage.io/techdocs-ref'],
  );

  const ownedByGroup = useAsync(async () => {
    const ownedBy = entity.relations?.find(
      rel =>
        rel.type === 'ownedBy' &&
        rel.targetRef.toLowerCase().startsWith('group'),
    );
    if (ownedBy) {
      return await catalogApi.getEntityByRef(ownedBy.targetRef);
    }
    return undefined;
  }, [entity, catalogApi]);

  return (
    <TabbedLayout>
      <TabbedLayout.Route path="/" title="Ownership">
        <Flex gap="2" direction="column">
          <SystemRelationCard
            system={system}
            dependency="service"
            data={systemDefinition.services}
          />
          <SystemRelationCard
            system={system}
            dependency="api"
            data={systemDefinition.apis}
          />
          {systemDefinition.libraries && systemDefinition.libraries.length > 0 && (
            <SystemRelationCard
              system={system}
              dependency="library"
              data={systemDefinition.libraries}
            />
          )}
        </Flex>
      </TabbedLayout.Route>

      <TabbedLayout.Route path="/members" title="Members">
        <EntityProvider entity={ownedByGroup.value}>
          <EntityMembersListCard />
        </EntityProvider>
      </TabbedLayout.Route>

      <TabbedLayout.Route path="/info" title="Info">
        <Grid.Root columns="12">
          <Grid.Item colSpan="6">
            <InfoCard
              title="About"
              divider
              className={styles.gridItemCard}
              action={
                <ButtonLink
                  href={`/docs/${entityRef.namespace}/${entityRef.kind}/${entityRef.name}`}
                  isDisabled={!hasDocs}
                  size="medium"
                  variant="tertiary"
                  iconStart={<RiFileFill />}
                />
              }
            >
              <Box mb="4">
                <AboutField label="System reference">
                  <EntityRefLink entityRef={entity} />
                </AboutField>
              </Box>
              <ComponentAboutContent entity={entity} />
            </InfoCard>
          </Grid.Item>
        </Grid.Root>
      </TabbedLayout.Route>
    </TabbedLayout>
  );
};
