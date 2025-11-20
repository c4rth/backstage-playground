import { Content, PageWithHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ApiPlatformTable } from '../ApiPlatformTable';
import { InfoPopUp, InfoPopUpContent } from '@internal/plugin-api-platform-react';
import { useMemo } from 'react';
import { getStringForKey } from '../common';

const INFO_POPUP_CONTENT = (
  <InfoPopUpContent
    text1={getStringForKey('ApiPlatformExplorerPage.text1')}
    text2={getStringForKey('ApiPlatformExplorerPage.text2')}
  />
);

export const ApiPlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);

  const subtitle = useMemo(() => {
    const orgName = configApi.getOptionalString('organization.name') ?? 'Backstage';
    return (
      <InfoPopUp
        text={`${orgName} API Explorer`}
        content={INFO_POPUP_CONTENT}
      />
    );
  }, [configApi]);

  return (
    <PageWithHeader
      themeId="apis"
      title="APIs"
      subtitle={subtitle}
      pageTitleOverride="APIs"
    >
      <Content>
        <ApiPlatformTable />
      </Content>
    </PageWithHeader>
  );
};