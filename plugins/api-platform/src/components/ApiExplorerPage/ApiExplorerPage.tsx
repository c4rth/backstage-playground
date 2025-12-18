import { Content, PageWithHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ApiTable } from '../ApiTable';
import { InfoPopUp, InfoPopUpContent } from '@internal/plugin-api-platform-react';
import { getStringForKey } from '../common';

const INFO_POPUP_CONTENT = (
  <InfoPopUpContent
    text1={getStringForKey('ApiExplorerPage.text1')}
    text2={getStringForKey('ApiExplorerPage.text2')}
  />
);

export const ApiExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const orgName = configApi.getOptionalString('organization.name') ?? 'Backstage';

  return (
    <PageWithHeader
      themeId="apis"
      title="APIs"
      subtitle={
        <InfoPopUp
          text={`${orgName} API Explorer`}
          content={INFO_POPUP_CONTENT}
        />
      }
      pageTitleOverride="APIs"
    >
      <Content>
        <ApiTable />
      </Content>
    </PageWithHeader>
  );
};