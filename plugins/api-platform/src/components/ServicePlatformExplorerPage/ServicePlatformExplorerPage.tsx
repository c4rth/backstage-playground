import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ServicePlatformTable } from '../ServicePlatformTable';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { Typography } from '@material-ui/core';

const infoPopUpContent = (
  <>
    <Typography variant="body1">
      Browse all service definitions registered in your Backstage instance. This screen provides a searchable and filterable table of services, including their names, descriptions, and associated metadata. Use this view to quickly find, review, and navigate to detailed information about each service in your platform.
    </Typography>
    <Typography variant="body2">
      <i>The Service Explorer helps you maintain visibility and control over your service landscape, making it easy to discover, document, and govern your organization's services.</i>
    </Typography>
  </>
);

export const ServicePlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Service Explorer`;

  return (
    <PageWithHeader
      themeId="apis"
      title="Services"
      subtitle={
        <InfoPopUp
          text={generatedSubtitle}
          variant="subtitle2"
          content={infoPopUpContent}
        />
      }
      pageTitleOverride="Services"
    >
      <Content>
        <ServicePlatformTable />
      </Content>
    </PageWithHeader>
  );
};