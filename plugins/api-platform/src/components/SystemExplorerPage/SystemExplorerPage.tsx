import { Content, PageWithHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { SystemTable } from '../SystemTable';
import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-api-platform-react';
import { getStringForKey } from '../common';
import { Container, FullPage, PluginHeader } from '@backstage/ui';

const POPUP_CONTENT = (
  <InformationPopupContent
    text1={getStringForKey('SystemPlatformExplorerPage.text1')}
    text2={getStringForKey('SystemPlatformExplorerPage.text2')}
  />
);

export const SystemExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const orgName =
    configApi.getOptionalString('organization.name') ?? 'Backstage';

  const subtitle = (
    <InformationPopup
      text={`${orgName} Team Explorer`}
      content={POPUP_CONTENT}
    />
  );

  const pageContent = (
    <Content>
      <SystemTable />
    </Content>
  );

  return (
    <PageWithHeader
      themeId="systems"
      title="Systems"
      subtitle={subtitle}
      pageTitleOverride="Systems"
    >
      {pageContent}
    </PageWithHeader>
  );
};

export const NfsSystemExplorerPage = () => {

  return (
    <>
      <PluginHeader
        title="APIs"
        customActions={<InformationPopup content={POPUP_CONTENT} />} />
      <FullPage>
        <Container>
          <SystemTable />
        </Container>
      </FullPage>
    </>
  );
};
