import { Content, PageWithHeader } from '@backstage/core-components';
import { useRouteRefParams } from '@backstage/core-plugin-api';
import {
  AsyncEntityProvider,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { useGetSystem } from '../../hooks';
import { SystemDefinitionCard } from './SystemDefinitionCard';

export const SystemDefinitionPage = () => {
  const { name } = useRouteRefParams(entityRouteRef);
  const { systemDefinition, loading, error } = useGetSystem(name);

  return (
    <AsyncEntityProvider
      loading={loading}
      error={error}
      entity={systemDefinition?.entity}
    >
      <PageWithHeader themeId="systems" title={name} type="System">
        <Content>
          {systemDefinition && name && (
            <SystemDefinitionCard
              system={name}
              systemDefinition={systemDefinition}
            />
          )}
        </Content>
      </PageWithHeader>
    </AsyncEntityProvider>
  );
};
