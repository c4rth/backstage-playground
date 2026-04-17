import {
  Content,
  PageWithHeader,
  Select,
  SelectItem,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { McaComponentTable } from '../McaComponentTable';
import { InformationPopup, InformationPopupContent } from '@internal/plugin-api-platform-react';
import { useState } from 'react';
import { McaComponentType } from '@internal/plugin-mca-common';
import { Alert, Box, Flex, Grid, } from '@backstage/ui';

const STORAGE_KEY = 'mcaComponentExplorerPageType';
const DEFAULT_TYPE = 'operation';

const POPUP_CONTENT = (
  <InformationPopupContent
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

  const subtitleComponent = (
    <InformationPopup
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
            <Grid.Item>
              <Flex style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Flex align="center" gap="3">
                  <Alert status="warning" icon title="Only MCA components promoted to PRD or those where P is &ge; to the current PRD P value are visible." />
                </Flex>
              </Flex>
            </Grid.Item>
          </Grid.Root>
        </Box>
        <McaComponentTable type={selectedType} />
      </Content>
    </PageWithHeader>
  );
}