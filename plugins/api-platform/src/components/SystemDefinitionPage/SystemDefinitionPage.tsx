import { RiShapesLine } from '@remixicon/react';
import { useRouteRefParams } from '@backstage/core-plugin-api';
import {
  AsyncEntityProvider,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { useGetSystem } from '../../hooks';
import { SystemDefinitionCard } from './SystemDefinitionCard';
import { Container, PluginHeader } from '@backstage/ui';

export const SystemDefinitionPage = () => {
  const { name } = useRouteRefParams(entityRouteRef);
  const { systemDefinition, loading, error } = useGetSystem(name);

  return (
    <AsyncEntityProvider
      loading={loading}
      error={error}
      entity={systemDefinition?.entity}
    >
      <PluginHeader
        title={`System - ${name}`}
        icon={<RiShapesLine fontSize="inherit" />}
      />
      <Container>
        {systemDefinition && name && (
          <SystemDefinitionCard
            system={name}
            systemDefinition={systemDefinition}
          />
        )}
      </Container>
    </AsyncEntityProvider>
  );
};
