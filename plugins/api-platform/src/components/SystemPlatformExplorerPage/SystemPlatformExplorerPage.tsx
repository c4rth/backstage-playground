import {
  Content,
  PageWithHeader,
  SelectItem,
  Select,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { SystemPlatformTable, OwnedSystemPlatformTable } from '../SystemPlatformTable';
import { Box, Grid, Typography } from '@material-ui/core';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { useMemo, useState } from 'react';

const infoPopUpContent = (
  <>
    <Typography variant="body1">
      View all system definitions registered in Backstage. This screen provides a searchable and filterable table of systems, including their names, descriptions, and related metadata. Use this view to quickly find, review, and navigate to detailed information about each system in your platform.
    </Typography>
    <Typography variant="body2">
      <i>The System Explorer helps you maintain visibility and control over your organization's systems, making it easy to discover, document, and govern your technical landscape.</i>
    </Typography>
  </>
);

export const SystemPlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Team Explorer`;

  const types: SelectItem[] = useMemo(
    () => [
      { label: 'All systems', value: 'all' },
      { label: 'Owned systems', value: 'owned' },
    ],
    [],
  );
  const [selectedType, setSelectedType] = useState<string>(
    sessionStorage.getItem('systemsExplorerPageType') || 'all',
  );

  const handleSelectChange = (selected: string) => {
    sessionStorage.setItem('systemsExplorerPageType', selected);
    setSelectedType(selected);
  };

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
        <Box mb={1}>
          <Grid container>
            <Grid item md={6}>
              <Select
                onChange={selected => handleSelectChange(selected.toString())}
                label="Type"
                items={types}
                selected={selectedType}
              />
            </Grid>
          </Grid>
        </Box>
        {selectedType === 'all' && (
          <SystemPlatformTable />
        )}
        {selectedType === 'owned' && (
          <OwnedSystemPlatformTable />
        )}
      </Content>
    </PageWithHeader>
  );
};