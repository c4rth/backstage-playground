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
import { useEffect, useMemo, useState } from 'react';
import { McaComponentType } from '@internal/plugin-mca-common';

const infoPopUpContent = (
    <>
      <Typography variant="body1">
        Explore all MCA components (operations and elements) registered in Backstage. This screen provides a searchable and filterable table of components, allowing you to quickly find, review, and navigate to detailed information about each operation or element in your platform.
      </Typography>
      <Typography variant="body2">
        <i>The MCA Components Explorer helps you maintain visibility and control over your organization's MCA operations and elements, making it easy to discover, document, and govern your technical building blocks.</i>
      </Typography>
    </>
  );

export const McaComponentExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} MCA Components Explorer`;

  const types: SelectItem[] = useMemo(
    () => [
      { label: 'Operations', value: 'operation' },
      { label: 'Elements', value: 'element' },
      { label: 'All components', value: 'all' },
    ],
    [],
  );
  const [selectedStringType, setSelectedStringType] = useState<string>(
    sessionStorage.getItem('mcaComponentExplorerPageType') || 'operation',
  );
  const [selectedType, setSelectedType] = useState<McaComponentType>(
    (sessionStorage.getItem('mcaComponentExplorerPageType') || 'operation') as McaComponentType,
  );

  useEffect(() => {
    const selected = types.find(item => item.value === selectedStringType);
    if (selected) setSelectedType(selected.value as McaComponentType);
  }, [selectedStringType, types]);

  const handleSelectChange = (selected: string) => {
    sessionStorage.setItem('mcaComponentExplorerPageType', selected);
    setSelectedStringType(selected);
  };

  return (
    <PageWithHeader
      themeId="apis"
      title="MCA Components"
      subtitle={
        <InfoPopUp
          text={generatedSubtitle}
          variant="subtitle2"
          content={infoPopUpContent }
        />
      }
      pageTitleOverride="MCA Components"
    >
      <Content>
        <Box mb={1}>
          <Grid container>
            <Grid item md={6}>
              <Select
                onChange={selected => handleSelectChange(selected.toString())}
                label="Type"
                items={types}
                selected={selectedStringType}
              />
            </Grid>
          </Grid>
        </Box>
        <McaComponentTable type={selectedType} />
      </Content>
    </PageWithHeader>
  );
};