import { getCompoundEntityRef } from '@backstage/catalog-model';
import {
  catalogApiRef,
  EntityInfoCard,
  EntityProvider,
  EntityRefLink,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { AboutField } from '@backstage/plugin-catalog';
import { SystemRelationCard } from './SystemRelationCard';
import { EntityMembersListCard } from '@backstage/plugin-org';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { ComponentAboutContent } from '../common/ComponentAboutContent';
import { RiFileFill } from '@remixicon/react';
import { Box, Grid, Flex, ButtonLink } from '@backstage/ui';
import { SystemDefinition } from '@internal/plugin-api-platform-common';

interface SystemDefinitionCardProps {
  system: string;
  systemDefinition?: SystemDefinition;
}

export const SystemDefinitionOwnershipCard = ({
  system,
  systemDefinition,
}: SystemDefinitionCardProps) => {
  if (!systemDefinition) {
    return null;
  }
  return (
    <Flex gap="4" direction="column">
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
  );
};

export const SystemDefinitionMembersCard = () => {
  const catalogApi = useApi(catalogApiRef);
  const { entity } = useEntity();

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

  return ownedByGroup.value ? (
    <EntityProvider entity={ownedByGroup.value}>
      <EntityMembersListCard />
    </EntityProvider>
  ) : null;
};

export const SystemDefinitionInfoCard = () => {
  const { entity } = useEntity();
  const entityRef = getCompoundEntityRef(entity);
  const hasDocs = Boolean(
    entity.metadata.annotations?.['backstage.io/techdocs-ref'],
  );

  return (
    <Grid.Root columns="12">
      <Grid.Item colSpan="6">
        <EntityInfoCard
          title="About"
          headerActions={
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
        </EntityInfoCard>
      </Grid.Item>
    </Grid.Root>
  );
};
