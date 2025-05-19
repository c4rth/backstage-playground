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
import { useEffect, useState } from 'react';
import { McaComponentType } from '@internal/plugin-mca-common';

export const McaComponentExplorerPage = () => {

  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} MCA Explorer`;

  const [types, _] = useState<SelectItem[]>([{ label: 'Operations', value: 'operation' }, { label: 'Elements', value: 'element' }, { label: 'All components', value: 'all' }]);
  const [selectedStringType, setSelectedStringType] = useState<string>(sessionStorage.getItem('mcaComponentExplorerPageType') ||'operation');
  const [selectedType, setSelectedType] = useState<McaComponentType>((sessionStorage.getItem('mcaComponentExplorerPageType') ||'operation') as McaComponentType);

  useEffect(() => {
    if (selectedStringType) {
      const selected = types.find(item => item.value === selectedStringType);
      if (selected) {
        setSelectedType(selected.value as McaComponentType);
      }
    }
  }, [selectedStringType, types]);

  function handleSelectChange(selected: string) {
    sessionStorage.setItem('mcaComponentExplorerPageType', selected);
    setSelectedStringType(selected);
  }

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
        <Box mb={1}>
          <Grid container>
            <Grid item md={6}>
              <Select onChange={(selected) => { handleSelectChange(selected.toString()) }} label="Type" items={types} selected={selectedStringType} />
            </Grid>
          </Grid>
        </Box>
        <McaComponentTable type={selectedType} />
      </Content>
    </PageWithHeader>
  );
};