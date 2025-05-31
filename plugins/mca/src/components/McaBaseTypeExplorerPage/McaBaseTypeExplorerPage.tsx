import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { Typography } from '@material-ui/core';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { McaBaseTypeTable } from '../McaBaseTypeTable/McaBaseTypeTable';

const infoPopUpContent = (
  <>
    <Typography variant="body1">
      Explore all MCA base type definitions registered in your Backstage instance. This screen provides a searchable and filterable table of base types, including their names and associated packages. Use this view to quickly find, review, and navigate to detailed information about each base type in your platform.
    </Typography>
    <Typography variant="body2">
      <i>The MCA BaseType Explorer helps you maintain visibility and control over your organization's base types, making it easy to discover, document, and govern your technical building blocks.</i>
    </Typography>
  </>
);

export const McaBaseTypeExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} MCA BaseType Explorer`;

  return (
    <PageWithHeader
      themeId="apis"
      title="MCA BaseTypes"
      subtitle={
        <InfoPopUp
          text={generatedSubtitle}
          variant="subtitle2"
          content={infoPopUpContent}
        />
      }
      pageTitleOverride="MCA BaseTypes"
    >
      <Content>
        <McaBaseTypeTable />
      </Content>
    </PageWithHeader>
  );
};