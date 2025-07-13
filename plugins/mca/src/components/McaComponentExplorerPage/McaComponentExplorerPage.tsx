import {
  Content,
  PageWithHeader,
  Select,
  SelectItem,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { Box, Grid, Typography } from '@material-ui/core';
import { McaComponentTable } from '../McaComponentTable';
import { InfoPopUp } from '@internal/plugin-api-platform-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { McaComponentType } from '@internal/plugin-mca-common';

const STORAGE_KEY = 'mcaComponentExplorerPageType';
const DEFAULT_TYPE = 'operation';

const InfoPopUpContent = memo(() => (
  <>
    <Typography variant="body1">
      Explore all MCA components (operations and elements) registered in Backstage. This screen provides a searchable and filterable table of components, allowing you to quickly find, review, and navigate to detailed information about each operation or element in your platform.
    </Typography>
    <Typography variant="body2">
      <i>The MCA Components Explorer helps you maintain visibility and control over your organization's MCA operations and elements, making it easy to discover, document, and govern your technical building blocks.</i>
    </Typography>
  </>
));

const componentTypes: SelectItem[] = [
  { label: 'Operations', value: 'operation' },
  { label: 'Elements', value: 'element' },
  { label: 'All components', value: 'all' },
];

function getInitialType(): McaComponentType {
  const storedType = sessionStorage.getItem(STORAGE_KEY);
  return (storedType as McaComponentType) || DEFAULT_TYPE;
}

function normalizeComponentType(type: string): McaComponentType {
  const validTypes = ['operation', 'element', 'all'] as const;
  return validTypes.includes(type as McaComponentType) 
    ? (type as McaComponentType) 
    : DEFAULT_TYPE;
}

export const McaComponentExplorerPage = () => {
  const configApi = useApi(configApiRef);
  
  const organizationName = useMemo(() => 
    configApi.getOptionalString('organization.name') ?? 'Backstage',
    [configApi]
  );

  const subtitle = useMemo(() => 
    `${organizationName} MCA Components Explorer`,
    [organizationName]
  );

  const [selectedType, setSelectedType] = useState<McaComponentType>(() => 
    getInitialType()
  );

  const handleSelectChange = useCallback((selected: string) => {
    const normalizedType = normalizeComponentType(selected);
    sessionStorage.setItem(STORAGE_KEY, normalizedType);
    setSelectedType(normalizedType);
  }, []);

  const subtitleComponent = useMemo(() => (
    <InfoPopUp
      text={subtitle}
      variant="subtitle2"
      content={<InfoPopUpContent />}
    />
  ), [subtitle]);

  return (
    <PageWithHeader
      themeId="apis"
      title="MCA Components"
      subtitle={subtitleComponent}
      pageTitleOverride="MCA Components"
    >
      <Content>
        <Box mb={1}>
          <Grid container>
            <Grid item md={6}>
              <Select
                onChange={selected => handleSelectChange(selected.toString())}
                label="Type"
                items={componentTypes}
                selected={selectedType}
              />
            </Grid>
          </Grid>
        </Box>
        <McaComponentTable type={selectedType} />
      </Content>
    </PageWithHeader>
  );
}