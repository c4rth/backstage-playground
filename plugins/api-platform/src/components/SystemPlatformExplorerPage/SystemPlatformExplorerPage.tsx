import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { SystemPlatformTable } from '../SystemPlatformTable';
import { Typography } from '@material-ui/core';
import { InfoPopUp } from '@internal/plugin-api-platform-react';

const infoPopUpContent = (
  <>
    <Typography variant="body1">
      View all system definitions registered in your Backstage instance. This screen provides a searchable and filterable table of systems, including their names, descriptions, and related metadata. Use this view to quickly find, review, and navigate to detailed information about each system in your platform.
    </Typography>
    <Typography variant="body2">
      <i>The System Explorer helps you maintain visibility and control over your organization's systems, making it easy to discover, document, and govern your technical landscape.</i>
    </Typography>
  </>
);

export const SystemPlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Team Explorer`;

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