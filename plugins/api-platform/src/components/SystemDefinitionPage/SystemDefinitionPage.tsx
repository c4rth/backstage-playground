import { RiShapesLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { apiPlatformTranslationRef } from '../../translation';
import { useRouteRefParams } from '@backstage/core-plugin-api';
import { useDocumentTitle } from '@internal/plugin-components-react';
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
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  const { name } = useRouteRefParams(entityRouteRef);
  const { systemDefinition, loading, error } = useGetSystem(name);
  useDocumentTitle(t('systemDefinition.documentTitle', { name }));

  return (
    <AsyncEntityProvider
      loading={loading}
      error={error}
      entity={systemDefinition?.entity}
    >
      <PluginHeader
        icon={<RiShapesLine fontSize="inherit" />}
        breadcrumbs={[
          {
            label: t('systemDefinition.breadcrumb'),
            href: '/api-platform/system',
          },
          { label: name, href: '' },
        ]}
      />
      <Header
        title={name}
        tabs={[
          {
            id: 'ownership',
            label: t('systemDefinition.ownership'),
            href: '.',
          },
          {
            id: 'members',
            label: t('systemDefinition.members'),
            href: 'members',
          },
          { id: 'info', label: t('systemDefinition.info'), href: 'info' },
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
