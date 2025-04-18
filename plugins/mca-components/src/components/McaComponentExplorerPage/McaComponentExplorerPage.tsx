import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { Typography } from '@material-ui/core';
import { McaComponentTable } from '../McaComponentTable';
import { InfoPopUp } from '@internal/plugin-api-platform-react';

export const McaComponentExplorerPage = () => {

  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} MCA Explorer`;

  return (
    <PageWithHeader
      themeId="apis"
      title="MCA Components"
      subtitle={
        <InfoPopUp
          text={generatedSubtitle}
          variant="subtitle2"
          content={
            <>
              <Typography variant="body1">This is a description of the {generatedSubtitle}. This is a description of the {generatedSubtitle}. This is a description of the {generatedSubtitle}.</Typography>
              <Typography variant="body2">This is a description of the {generatedSubtitle}. This is a description of the {generatedSubtitle}. This is a description of the {generatedSubtitle}.</Typography>
            </>
          } />
      }
      pageTitleOverride="MCA Components"
    >
      <Content>
        <McaComponentTable />
      </Content>
    </PageWithHeader>
  );
};