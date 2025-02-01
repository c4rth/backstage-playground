import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import React from 'react';
import { ServicePlatformTable } from '../ServicePlatformTable';

export const ServicePlatformExplorerPage = () => {

  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Service Explorer`;

  return (
    <PageWithHeader
      themeId="apis"
      title="Services"
      subtitle={generatedSubtitle}
      pageTitleOverride="Services"
    >
      <Content>
        <ServicePlatformTable />
      </Content>
    </PageWithHeader>
  );
};