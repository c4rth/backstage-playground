import {
  Content,
  PageWithHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { configApiRef, useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import React from 'react';
import { useGetSystem } from '../../hooks';
import { Box } from '@material-ui/core';
import { SystemPlatformDefinitionCard } from './SystemPlatformDefinitionCard';

export const SystemPlatformDefinitionPage = () => {
  const { name } = useRouteRefParams(entityRouteRef);
  const { systemDefinition, loading, error } = useGetSystem(name);

  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Team Explorer`;

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (loading) {
    return <Progress />
  }

  return (
    <PageWithHeader
      themeId="systems"
      title={`Team - ${name}`}
      subtitle={generatedSubtitle}>
      <Content>
        <Box mb={-3}>
          {systemDefinition ?
            <SystemPlatformDefinitionCard systemDefinition={systemDefinition} />
            : <div />
          }
        </Box>
      </Content>
    </PageWithHeader>
  );
};