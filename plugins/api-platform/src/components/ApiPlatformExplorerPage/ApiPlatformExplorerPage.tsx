import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ApiPlatformTable } from '../ApiPlatformTable';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { Box, Grid, Typography } from '@material-ui/core';
import { useMemo, useState } from 'react';
import { ComponentOwnership } from '../common';

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

const STORAGE_KEY = 'apisExplorerPageOwner';

export const ApiPlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);


  const [selectedType, setSelectedType] = useState<'all' | 'owned'>(
    () => (sessionStorage.getItem(STORAGE_KEY) === 'owned' ? 'owned' : 'all')
  );

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
        <Box mb={1}>
          <Grid container>
            <Grid item md={6}>
              <ComponentOwnership
                storageKey={STORAGE_KEY}
                suffix="APIs"
                handleOwnershipChange={setSelectedType}
              />
            </Grid>
          </Grid>
        </Box>
        <ApiPlatformTable ownership={selectedType} />
      </Content>
    </PageWithHeader>
  );
};