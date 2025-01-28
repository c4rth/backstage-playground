import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import React from 'react';
import { ServiceTable } from '../ServiceTable';

export const ServiceExplorerPage = () => {

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
        <ServiceTable />
      </Content>
    </PageWithHeader>
  );
};