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
import { useCallback, useMemo, useState } from 'react';

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

const SYSTEM_TYPES: SelectItem[] = [
  { label: 'All systems', value: 'all' },
  { label: 'Owned systems', value: 'owned' },
];
const STORAGE_KEY = 'systemsExplorerPageType';
const DEFAULT_TYPE = 'all';

export const SystemPlatformExplorerPage = () => {
  const configApi = useApi(configApiRef);

  const generatedSubtitle = useMemo(() =>
    `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Team Explorer`,
    [configApi]
  );

  const [selectedType, setSelectedType] = useState<string>(() =>
    sessionStorage.getItem(STORAGE_KEY) || DEFAULT_TYPE
  );

  const handleSelectChange = useCallback((selected: string) => {
    sessionStorage.setItem(STORAGE_KEY, selected);
    setSelectedType(selected);
  }, []);

  const subtitleComponent = useMemo(() => (
    <InfoPopUp
      text={generatedSubtitle}
      variant="subtitle2"
      content={INFO_POPUP_CONTENT}
    />
  ), [generatedSubtitle]);

  const renderTable = useMemo(() => {
    switch (selectedType) {
      case 'owned':
        return <OwnedSystemPlatformTable />;
      case 'all':
      default:
        return <SystemPlatformTable />;
    }
  }, [selectedType]);

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
              <Select
                onChange={selected => handleSelectChange(selected.toString())}
                label="Type"
                items={SYSTEM_TYPES}
                selected={selectedType}
              />
            </Grid>
          </Grid>
        </Box>
        {renderTable}
      </Content>
    </PageWithHeader>
  );
};