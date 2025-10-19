import {
  Content,
  PageWithHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { configApiRef, useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { EntityProvider, entityRouteRef } from '@backstage/plugin-catalog-react';
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
  const content = useMemo(() => {
    if (!systemDefinition) {
      return null;
    }

    return (
      <EntityProvider entity={systemDefinition.entity}>
        <SystemPlatformDefinitionCard
          system={name}
          apis={systemDefinition.apis}
          services={systemDefinition.services}
        />
      </EntityProvider>
    );
  }, [systemDefinition, name]);


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
        <Box mb='-3'>
          {content}
        </Box>
      </Content>
    </PageWithHeader>
  );
};