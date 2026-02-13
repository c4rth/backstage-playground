import { Content, PageWithHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ServiceTable } from '../ServiceTable';
import { InformationPopup, InformationPopupContent } from '@internal/plugin-api-platform-react';
import { getStringForKey } from '../common';

const INFO_POPUP_CONTENT = (
  <InformationPopupContent
    text1={getStringForKey('ServicePlatformExplorerPage.text1')}
    text2={getStringForKey('ServicePlatformExplorerPage.text2')}
  />
);

export const ServiceExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const orgName = configApi.getOptionalString('organization.name') ?? 'Backstage';

  return (
    <PageWithHeader
      themeId="apis"
      title="Services"
      subtitle={
        <InformationPopup
          text={`${orgName} Service Explorer`}
          content={INFO_POPUP_CONTENT}
        />
      }
      pageTitleOverride="Services"
    >
      <Content>
        <ServiceTable />
      </Content>
    </PageWithHeader>
  );
};