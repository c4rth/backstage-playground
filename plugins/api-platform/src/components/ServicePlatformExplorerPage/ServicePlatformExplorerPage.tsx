import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ServicePlatformTable } from '../ServicePlatformTable';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { Typography } from '@material-ui/core';
import { useMemo } from 'react';

const INFO_POPUP_CONTENT = (
  <>
    <Typography variant="body1">
      Browse all service definitions registered in Backstage. This screen provides a searchable and filterable table of services, including their names, descriptions, and associated metadata. Use this view to quickly find, review, and navigate to detailed information about each service in your platform.
    </Typography>
    <Typography variant="body2">
      <i>The Service Explorer helps you maintain visibility and control over your service landscape, making it easy to discover, document, and govern your organization's services.</i>
    </Typography>
  </>
);

export const ServicePlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const generatedSubtitle = useMemo(() =>
    `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Service Explorer`,
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
      title="Services"
      subtitle={subtitleComponent}
      pageTitleOverride="Services"
    >
      <Content>
        <ServicePlatformTable />
      </Content>
    </PageWithHeader>
  );
};