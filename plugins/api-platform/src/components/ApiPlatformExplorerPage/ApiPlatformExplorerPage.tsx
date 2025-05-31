import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ApiPlatformTable } from '../ApiPlatformTable';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { Typography } from '@material-ui/core';

const infoPopUpContent = (
  <>
    <Typography variant="body1">
      Explore all API definitions registered in your Backstage instance. This screen provides a searchable and filterable table of APIs, including their names, descriptions, and associated systems. Use this view to quickly find, review, and navigate to detailed information about each API in your platform.
    </Typography>
    <Typography variant="body2">
      <i>The API Explorer helps you maintain visibility and control over your API landscape, making it easy to discover, document, and govern your organization's APIs.</i>
    </Typography>
  </>
);

export const ApiPlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} API Explorer`;


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