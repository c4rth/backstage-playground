import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ApiPlatformTable } from '../ApiPlatformTable';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { Typography } from '@material-ui/core';
import { useMemo } from 'react';

const INFO_POPUP_CONTENT = (
  <>
    <Typography variant="body1">
      Explore all API definitions registered in Backstage. This screen provides a searchable and filterable table of APIs, including their names, descriptions, and associated systems. Use this view to quickly find, review, and navigate to detailed information about each API in your platform.
    </Typography>
    <Typography variant="body2">
      <i>The API Explorer helps you maintain visibility and control over your API landscape, making it easy to discover, document, and govern your organization's APIs.</i>
    </Typography>
  </>
);

export const ApiPlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const generatedSubtitle = useMemo(() =>
    `${configApi.getOptionalString('organization.name') ?? 'Backstage'} API Explorer`,
    [configApi]
  );

  const subtitleComponent = useMemo(() => (
    <InfoPopUp
      text={generatedSubtitle}
      variant="subtitle2"
      content={INFO_POPUP_CONTENT}
    />
  ), [generatedSubtitle]);

  return (
    <PageWithHeader
      themeId="apis"
      title="APIs"
      subtitle={subtitleComponent}
      pageTitleOverride="APIs"
    >
      <Content>
        <ApiPlatformTable />
      </Content>
    </PageWithHeader>
  );
};