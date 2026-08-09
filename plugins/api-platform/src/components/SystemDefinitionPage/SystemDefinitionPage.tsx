import { RiShapesLine } from '@remixicon/react';
import { useRouteRefParams } from '@backstage/core-plugin-api';
import {
  AsyncEntityProvider,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { useGetSystem } from '../../hooks';
import { SystemDefinitionCard } from './SystemDefinitionCard';
import { Container, PluginHeader, Header } from '@backstage/ui';

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
        icon={<RiShapesLine fontSize="inherit" />}
        breadcrumbs={[
          { label: 'Systems', href: '/api-platform/system' },
        ]}
      />
      <Header
        title={name} />
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
