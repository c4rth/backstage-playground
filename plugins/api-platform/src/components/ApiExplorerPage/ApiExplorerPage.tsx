import { Content, PageWithHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ApiTable } from '../ApiTable';
import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-api-platform-react';
import { getStringForKey } from '../common';
import { Container, FullPage, PluginHeader } from '@backstage/ui';
import { RiPuzzleFill } from '@remixicon/react';

const INFO_POPUP_CONTENT = (
  <InformationPopupContent
    text1={getStringForKey('ApiExplorerPage.text1')}
    text2={getStringForKey('ApiExplorerPage.text2')}
  />
);

export const ApiExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const orgName =
    configApi.getOptionalString('organization.name') ?? 'Backstage';

  const subtitle = (
    <InformationPopup
      text={`${orgName} API Explorer`}
      content={INFO_POPUP_CONTENT}
    />
  );

  const pageContent = (
    <Content>
      <ApiTable />
    </Content>
  );

  return (
    <PageWithHeader
      themeId="apis"
      title="APIs"
      subtitle={subtitle}
      pageTitleOverride="APIs"
    >
      {pageContent}
    </PageWithHeader>
  );
};

export const NfsApiExplorerPage = () => {
  
  return (
    <>
      <PluginHeader
        title="APIs"
        icon={<RiPuzzleFill fontSize="inherit" />}
        customActions={<InformationPopup content={INFO_POPUP_CONTENT} />} />
      <FullPage>
        <Container>
          <ApiTable />
        </Container>
      </FullPage>
    </>
  );
};
