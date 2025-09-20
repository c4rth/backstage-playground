import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ServicePlatformTable } from '../ServicePlatformTable';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { useMemo } from 'react';
import { InfoPopUpContent } from '@internal/plugin-api-platform-react';
import { getStringForKey } from '../common';

export const ServicePlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);

  const generatedSubtitle = useMemo(() =>
    `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Service Explorer`,
    [configApi]
  );

  const subtitleComponent = useMemo(() => (
    <InfoPopUp
      text={generatedSubtitle}
      variant="subtitle2"
      content={<InfoPopUpContent
        text1={getStringForKey("ServicePlatformExplorerPage.text1")}
        text2={getStringForKey("ServicePlatformExplorerPage.text2")}
      />}
    />
  ), [generatedSubtitle]);

  return (
    <PageWithHeader
      themeId="apis"
      title="Services"
      subtitle={subtitleComponent}
      pageTitleOverride="Services"
    >
      <Content>
        <ServicePlatformTable />
      </Content>
    </PageWithHeader>
  );
};