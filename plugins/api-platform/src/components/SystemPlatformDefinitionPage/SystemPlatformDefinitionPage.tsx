import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { AsyncEntityProvider, entityRouteRef } from '@backstage/plugin-catalog-react';
import { useGetSystem } from '../../hooks';
import { Box } from '@backstage/ui';
import { SystemPlatformDefinitionCard } from './SystemPlatformDefinitionCard';
import { useMemo } from 'react';

export const SystemPlatformDefinitionPage = () => {
  const { name } = useRouteRefParams(entityRouteRef);
  const { systemDefinition, loading, error } = useGetSystem(name);
  const configApi = useApi(configApiRef);

  const generatedSubtitle = useMemo(() =>
    `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Team Explorer`,
    [configApi]
  );

  const pageTitle = useMemo(() => `Team - ${name}`, [name]);

  return (
    <AsyncEntityProvider loading={loading} error={error} entity={systemDefinition?.entity} >
      <PageWithHeader
        themeId="systems"
        title={pageTitle}
        subtitle={generatedSubtitle}
      >
        <Content>
          <Box mb='-3'>
            {(systemDefinition && name) && (
              <SystemPlatformDefinitionCard
                system={name}
                apis={systemDefinition.apis}
                services={systemDefinition.services}
              />
            )}
          </Box>
        </Content>
      </PageWithHeader>
    </AsyncEntityProvider>
  );
};