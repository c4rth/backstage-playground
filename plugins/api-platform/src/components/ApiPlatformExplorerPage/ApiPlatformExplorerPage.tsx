import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import React from 'react';
import { ApiPlatformTable } from '../ApiPlatformTable';
import { InfoPopUp } from '../SubtitleInfo/SubtitleInfo';

export const ApiPlatformExplorerPage = () => {

  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} API Explorer`;

  return (
    <PageWithHeader
      themeId="apis"
      title="APIs"
      subtitle={
        <InfoPopUp text={generatedSubtitle} variant="subtitle2" />
      }
      pageTitleOverride="APIs"
    >
      <Content>
        <ApiPlatformTable />
      </Content>
    </PageWithHeader>
  );
};