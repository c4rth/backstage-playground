import { Content, PageWithHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ServiceTable } from '../ServiceTable';
import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-api-platform-react';
import { getStringForKey } from '../common';
import { Container, FullPage, PluginHeader } from '@backstage/ui';
import { RiCpuLine } from '@remixicon/react';

const INFO_POPUP_CONTENT = (
  <InformationPopupContent
    text1={getStringForKey('ServicePlatformExplorerPage.text1')}
    text2={getStringForKey('ServicePlatformExplorerPage.text2')}
  />
);

export const ServiceExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const orgName =
    configApi.getOptionalString('organization.name') ?? 'Backstage';

  const subtitle = (
    <InformationPopup
      text={`${orgName} Service Explorer`}
      content={INFO_POPUP_CONTENT}
    />
  );

  const pageContent = (
    <Content>
      <ServiceTable />
    </Content>
  );

  return (
    <PageWithHeader
      themeId="apis"
      title="Services"
      subtitle={subtitle}
      pageTitleOverride="Services"
    >
      {pageContent}
    </PageWithHeader>
  );
};

export const NfsServiceExplorerPage = () => {
  return (
    <>
      <PluginHeader
        title="Services"
        icon={<RiCpuLine fontSize="inherit" />}
        customActions={<InformationPopup content={INFO_POPUP_CONTENT} />} />
      <FullPage>
        <Container>
          <ServiceTable />
        </Container>
      </FullPage>
    </>
  );
};
