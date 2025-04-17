import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ServicePlatformTable } from '../ServicePlatformTable';
import { InfoPopUp } from '../SubtitleInfo/SubtitleInfo';
import { Typography } from '@material-ui/core';

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
          content={
            <>
              <Typography variant="body1">This is a description of the {generatedSubtitle}. This is a description of the {generatedSubtitle}. This is a description of the {generatedSubtitle}.</Typography>
              <Typography variant="body2">This is a description of the {generatedSubtitle}. This is a description of the {generatedSubtitle}. This is a description of the {generatedSubtitle}.</Typography>
            </>
          } />}
      pageTitleOverride="Services"
    >
      <Content>
        <ServicePlatformTable />
      </Content>
    </PageWithHeader>
  );
};