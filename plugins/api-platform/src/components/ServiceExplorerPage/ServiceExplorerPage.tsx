import { Content, PageWithHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ServiceTable } from '../ServiceTable';
import { InfoPopUp, InfoPopUpContent } from '@internal/plugin-api-platform-react';
import { useMemo } from 'react';
import { getStringForKey } from '../common';

const INFO_POPUP_CONTENT = (
  <InfoPopUpContent
    text1={getStringForKey('ServicePlatformExplorerPage.text1')}
    text2={getStringForKey('ServicePlatformExplorerPage.text2')}
  />
);

export const ServiceExplorerPage = () => {
  const configApi = useApi(configApiRef);

  const subtitle = useMemo(() => {
    const orgName = configApi.getOptionalString('organization.name') ?? 'Backstage';
    return (
      <InfoPopUp
        text={`${orgName} Service Explorer`}
        content={INFO_POPUP_CONTENT}
      />
    );
  }, [configApi]);

  return (
    <PageWithHeader
      themeId="apis"
      title="Services"
      subtitle={subtitle}
      pageTitleOverride="Services"
    >
      <Content>
        <ServiceTable />
      </Content>
    </PageWithHeader>
  );
};