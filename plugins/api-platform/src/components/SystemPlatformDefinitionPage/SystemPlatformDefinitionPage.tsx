import {
  Content,
  PageWithHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { configApiRef, useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { EntityProvider, entityRouteRef } from '@backstage/plugin-catalog-react';
import { useGetSystem } from '../../hooks';
import { Box } from '@material-ui/core';
import { SystemPlatformDefinitionCard } from './SystemPlatformDefinitionCard';
import { useMemo, memo } from 'react';

export const SystemPlatformDefinitionPage = memo(() => {
  const { name } = useRouteRefParams(entityRouteRef);
  const { systemDefinition, loading, error } = useGetSystem(name);
  const configApi = useApi(configApiRef);

  const generatedSubtitle = useMemo(() =>
    `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Team Explorer`,
    [configApi]
  );

  const pageTitle = useMemo(() => `Team - ${name}`, [name]);
  const content = useMemo(() => {
    if (!systemDefinition) {
      return null;
    }

    return (
      <EntityProvider entity={systemDefinition.entity}>
        <SystemPlatformDefinitionCard
          apis={systemDefinition.apis}
          services={systemDefinition.services}
        />
      </EntityProvider>
    );
  }, [systemDefinition]);


  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (loading) {
    return <Progress />;
  }

  return (
    <PageWithHeader
      themeId="systems"
      title={pageTitle}
      subtitle={generatedSubtitle}
    >
      <Content>
        <Box mb={-3}>
          {content}
        </Box>
      </Content>
    </PageWithHeader>
  );
});