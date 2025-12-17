import {
  Content,
  PageWithHeader,
  Select,
  SelectItem,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { McaComponentTable } from '../McaComponentTable';
import { InfoPopUp, InfoPopUpContent } from '@internal/plugin-api-platform-react';
import { useState } from 'react';
import { McaComponentType } from '@internal/plugin-mca-common';
import { Box, Button, Flex, Grid } from '@backstage/ui';
import { mcaComponentsBackendApiRef } from '../../api';

const STORAGE_KEY = 'mcaComponentExplorerPageType';
const DEFAULT_TYPE = 'operation';

const POPUP_CONTENT = (
  <InfoPopUpContent
    text1="Explore all MCA components (operations and elements) registered in Backstage. This screen provides a searchable and filterable table of components, allowing you to quickly find, review, and navigate to detailed information about each operation or element in your platform."
    text2="The MCA Components Explorer helps you maintain visibility and control over your organization's MCA operations and elements, making it easy to discover, document, and govern your technical building blocks."
  />
);

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
  const mcaApi = useApi(mcaComponentsBackendApiRef);

  const organizationName = configApi.getOptionalString('organization.name') ?? 'Backstage';
  const subtitle = `${organizationName} MCA Components Explorer`;

  const [selectedType, setSelectedType] = useState<McaComponentType>(() =>
    getInitialType()
  );

  const handleSelectChange = (selected: string) => {
    const normalizedType = normalizeComponentType(selected);
    sessionStorage.setItem(STORAGE_KEY, normalizedType);
    setSelectedType(normalizedType);
  };

  const handleSchedule = () => {
    mcaApi.scheduleMcaComponentTask();
  };

  const subtitleComponent = (
    <InfoPopUp
      text={subtitle}
      content={POPUP_CONTENT}
    />
  );

  return (
    <PageWithHeader
      themeId="apis"
      title="MCA Components"
      subtitle={subtitleComponent}
      pageTitleOverride="MCA Components"
    >
      <Content>
        <Box mb='1'>
          <Grid.Root columns='2'>
            <Grid.Item>
              <Select
                onChange={selected => handleSelectChange(selected.toString())}
                label="Type"
                items={componentTypes}
                selected={selectedType}
              />
            </Grid.Item>
          </Grid.Root>
        </Box>
        <Box mb='1'>
          <Flex mb='4' mt='-3' style={{ justifyContent: 'end' }}>
            <Button variant='primary' onClick={handleSchedule}>
              DEBUG: Schedule
            </Button>
          </Flex>
        </Box>
        <McaComponentTable type={selectedType} />
      </Content>
    </PageWithHeader>
  );
}