import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { SystemPlatformTable } from '../SystemPlatformTable';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { useMemo, } from 'react';
import { InfoPopUpContent } from '@internal/plugin-api-platform-react';
import { getStringForKey } from '../common';

export const SystemPlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);

  const generatedSubtitle = useMemo(() =>
    `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Team Explorer`,
    [configApi]
  );

  const subtitleComponent = useMemo(() => (
    <InfoPopUp
      text={generatedSubtitle}
      variant="subtitle2"
      content={<InfoPopUpContent
        text1={getStringForKey("SystemPlatformExplorerPage.text1")}
        text2={getStringForKey("SystemPlatformExplorerPage.text2")}
      />}
    />
  ), [generatedSubtitle]);

  return (
    <PageWithHeader
      themeId="systems"
      title="Systems"
      subtitle={subtitleComponent}
      pageTitleOverride="Systems"
    >
      <Content>
        <SystemPlatformTable />
      </Content>
    </PageWithHeader>
  );
};