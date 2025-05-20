import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ApiPlatformTable } from '../ApiPlatformTable';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { Typography } from '@material-ui/core';

export const ApiPlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} API Explorer`;

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
      themeId="apis"
      title="APIs"
      subtitle={
        <InfoPopUp
          text={generatedSubtitle}
          variant="subtitle2"
          content={infoPopUpContent}
        />
      }
      pageTitleOverride="APIs"
    >
      <Content>
        <ApiPlatformTable />
      </Content>
    </PageWithHeader>
  );
};