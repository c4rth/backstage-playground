import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ApiPlatformTable } from '../ApiPlatformTable';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { useMemo } from 'react';
import { InfoPopUpContent } from '@internal/plugin-api-platform-react';
import { getStringForKey } from '../common';

export const ApiPlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);

  const generatedSubtitle = useMemo(() =>
    `${configApi.getOptionalString('organization.name') ?? 'Backstage'} API Explorer`,
    [configApi]
  );

  const subtitleComponent = useMemo(() => (
    <InfoPopUp
      text={generatedSubtitle}
      variant="subtitle2"
      content={<InfoPopUpContent
        text1={getStringForKey("ApiPlatformExplorerPage.text1")}
        text2={getStringForKey("ApiPlatformExplorerPage.text2")}
      />}
    />
  ), [generatedSubtitle]);

  return (
    <PageWithHeader
      themeId="apis"
      title="APIs"
      subtitle={subtitleComponent}
      pageTitleOverride="APIs"
    >
      <Content>
        <ApiPlatformTable />
      </Content>
    </PageWithHeader>
  );
};