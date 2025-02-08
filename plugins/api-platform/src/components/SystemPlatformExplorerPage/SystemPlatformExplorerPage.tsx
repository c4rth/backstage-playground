import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import React from 'react';
import { SystemPlatformTable } from '../SystemPlatformTable';

export const SystemPlatformExplorerPage = () => {

  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Team Explorer`;

  return (
    <PageWithHeader
      themeId="systems"
      title="Teams"
      subtitle={generatedSubtitle}
      pageTitleOverride="Teams"
    >
      <Content>
        <SystemPlatformTable />
      </Content>
    </PageWithHeader>
  );
};