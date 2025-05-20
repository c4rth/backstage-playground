import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { SystemPlatformTable } from '../SystemPlatformTable';
import { Typography } from '@material-ui/core';
import { InfoPopUp } from '@internal/plugin-api-platform-react';

export const SystemPlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Team Explorer`;

  const infoPopUpContent = (
    <>
      <Typography variant="body1">
        This is a description of the {generatedSubtitle}. This is a description of the {generatedSubtitle}. This is a description of the {generatedSubtitle}.
      </Typography>
      <Typography variant="body2">
        This is a description of the {generatedSubtitle}. This is a description of the {generatedSubtitle}. This is a description of the {generatedSubtitle}.
      </Typography>
    </>
  );

  return (
    <PageWithHeader
      themeId="systems"
      title="Systems"
      subtitle={
        <InfoPopUp
          text={generatedSubtitle}
          variant="subtitle2"
          content={infoPopUpContent}
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