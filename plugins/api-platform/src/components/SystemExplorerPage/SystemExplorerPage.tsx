import { Content, PageWithHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { SystemPlatformTable } from '../SystemTable';
import { InfoPopUp, InfoPopUpContent } from '@internal/plugin-api-platform-react';
import { getStringForKey } from '../common';

const POPUP_CONTENT = (
  <InfoPopUpContent
    text1={getStringForKey("SystemPlatformExplorerPage.text1")}
    text2={getStringForKey("SystemPlatformExplorerPage.text2")}
  />
);

export const SystemExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const orgName = configApi.getOptionalString('organization.name') ?? 'Backstage';

  return (
    <PageWithHeader
      themeId="systems"
      title="Systems"
      subtitle={
        <InfoPopUp
          text={`${orgName} Team Explorer`}
          content={POPUP_CONTENT}
        />
      }
      pageTitleOverride="Systems"
    >
      <Content>
        <SystemPlatformTable />
      </Content>
    </PageWithHeader>
  );
};