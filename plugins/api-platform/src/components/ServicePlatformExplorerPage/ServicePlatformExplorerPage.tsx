import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ServicePlatformTable } from '../ServicePlatformTable';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { Box, Grid, Typography } from '@material-ui/core';
import { useMemo, useState } from 'react';
import { ComponentOwnership } from '../common';

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

const STORAGE_KEY = 'servicesExplorerPageOwner';

export const ServicePlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);

  const [selectedType, setSelectedType] = useState<'all' | 'owned'>(
    () => (sessionStorage.getItem(STORAGE_KEY) === 'owned' ? 'owned' : 'all')
  );

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
        <Box mb={1}>
          <Grid container>
            <Grid item md={6}>
              <ComponentOwnership
                storageKey={STORAGE_KEY}
                suffix="Services"
                handleOwnershipChange={setSelectedType}
              />
            </Grid>
          </Grid>
        </Box>
        <ServicePlatformTable ownership={selectedType} />
      </Content>
    </PageWithHeader>
  );
};