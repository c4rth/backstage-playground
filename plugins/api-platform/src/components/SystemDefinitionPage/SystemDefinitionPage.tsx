import { RiShapesLine } from '@remixicon/react';
import { useRouteRefParams } from '@backstage/core-plugin-api';
import {
  AsyncEntityProvider,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { useGetSystem } from '../../hooks';
import { Container, PluginHeader, Header } from '@backstage/ui';
import { Routes, Route } from 'react-router-dom';
import {
  SystemDefinitionInfoCard,
  SystemDefinitionOwnershipCard,
  SystemDefinitionMembersCard,
} from './SystemDefinitionCards';

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
        breadcrumbs={[{ label: 'Systems', href: '/api-platform/system' }]}
      />
      <Header
        title={name}
        tabs={[
          { id: 'ownership', label: 'Ownership', href: '.' },
          { id: 'members', label: 'Members', href: 'members' },
          { id: 'info', label: 'Info', href: 'info' },
        ]}
      />
      <Container>
        {systemDefinition && (
          <Routes>
            <Route
              path="/"
              element={
                <SystemDefinitionOwnershipCard
                  system={name}
                  systemDefinition={systemDefinition}
                />
              }
            />
            <Route path="members" element={<SystemDefinitionMembersCard />} />
            <Route path="info" element={<SystemDefinitionInfoCard />} />
          </Routes>
        )}
      </Container>
    </AsyncEntityProvider>
  );
};
