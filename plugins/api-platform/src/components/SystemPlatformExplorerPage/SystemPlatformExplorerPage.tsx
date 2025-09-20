import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { SystemPlatformTable } from '../SystemPlatformTable';
import { Box, Grid, Typography } from '@material-ui/core';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { useMemo, useState } from 'react';
import { ComponentOwnership } from '../common';

const INFO_POPUP_CONTENT = (
  <>
    <Typography variant="body1">
      View all system definitions registered in Backstage. This screen provides a searchable and filterable table of systems, including their names, descriptions, and related metadata. Use this view to quickly find, review, and navigate to detailed information about each system in your platform.
    </Typography>
    <Typography variant="body2">
      <i>The System Explorer helps you maintain visibility and control over your organization's systems, making it easy to discover, document, and govern your technical landscape.</i>
    </Typography>
  </>
);

const STORAGE_KEY = 'systemsExplorerPageOwner';

export const SystemPlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);

  const generatedSubtitle = useMemo(() =>
    `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Team Explorer`,
    [configApi]
  );

  const [selectedType, setSelectedType] = useState<'all' | 'owned'>(
        () => (sessionStorage.getItem(STORAGE_KEY) === 'owned' ? 'owned' : 'all')
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
      themeId="systems"
      title="Systems"
      subtitle={subtitleComponent}
      pageTitleOverride="Systems"
    >
      <Content>
        <Box mb={1}>
          <Grid container>
            <Grid item md={6}>
              <ComponentOwnership
                storageKey={STORAGE_KEY}
                suffix="Systems"
                handleOwnershipChange={setSelectedType}
              />
            </Grid>
          </Grid>
        </Box>
        <SystemPlatformTable ownership={selectedType} />
      </Content>
    </PageWithHeader>
  );
};