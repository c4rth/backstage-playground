import { Content, PageWithHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { McaComponentTable } from '../McaComponentTable';
import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-api-platform-react';
import { useState } from 'react';
import { McaComponentType } from '@internal/plugin-mca-common';
import { Alert, Box, Flex, Grid, Select, Option, FullPage, PluginHeader, } from '@backstage/ui';
import { mcaComponentsBackendApiRef } from '../../api';
import useAsync from 'react-use/esm/useAsync';

const STORAGE_KEY = 'mcaComponentExplorerPageType';
const DEFAULT_TYPE = 'operation';

const POPUP_CONTENT = (
  <InformationPopupContent
    text1="Explore all MCA components (operations and elements) registered in Backstage. This screen provides a searchable and filterable table of components, allowing you to quickly find, review, and navigate to detailed information about each operation or element in your platform."
    text2="The MCA Components Explorer helps you maintain visibility and control over your organization's MCA operations and elements, making it easy to discover, document, and govern your technical building blocks."
  />
);

const componentTypes: Option[] = [
  { label: 'Operations', id: 'operation' },
  { label: 'Elements', id: 'element' },
  { label: 'All components', id: 'all' },
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

  const organizationName =
    configApi.getOptionalString('organization.name') ?? 'Backstage';

  const { value: lastModifiedDate } = useAsync(async () => {
    return mcaApi.getCsvLastModifiedDate();
  }, [mcaApi]);

  const subtitle = `${organizationName} MCA Components Explorer`;

  const [selectedType, setSelectedType] = useState<McaComponentType>(() =>
    getInitialType(),
  );

  const handleSelectChange = (selected: string) => {
    const normalizedType = normalizeComponentType(selected);
    sessionStorage.setItem(STORAGE_KEY, normalizedType);
    setSelectedType(normalizedType);
  };

  const subtitleComponent = (
    <InformationPopup text={subtitle} content={POPUP_CONTENT} />
  );

  const pageContent = (
    <>
      <Box mb="4">
        <Grid.Root columns="2">
          <Grid.Item>
            <Select
              onChange={selected => handleSelectChange(selected!.toString())}
              label="Type"
              options={componentTypes}
              value={selectedType}
            />
          </Grid.Item>
          <Grid.Item>
            <Flex
              style={{
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
              }}
            >
              <Alert
                status="warning"
                icon
                title="Only MCA components promoted to PRD or those where P is &ge; to the current PRD P value are visible."
                style={{ width: 'fit-content', alignSelf: 'flex-end' }}
              />
              <Alert
                status="info"
                icon
                title={`Last updated: ${lastModifiedDate?.toLocaleString('fr-BE') || 'Unknown'}`}
                style={{ width: 'fit-content', alignSelf: 'flex-end' }}
              />
            </Flex>
          </Grid.Item>
        </Grid.Root>
      </Box>
      <McaComponentTable type={selectedType} />
    </>
  );

  return (
    <PageWithHeader
      themeId="apis"
      title="MCA Components"
      subtitle={subtitleComponent}
      pageTitleOverride="MCA Components"
    >
      <Content>{pageContent}</Content>
    </PageWithHeader>
  );
};

export const NfsMcaComponentExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const mcaApi = useApi(mcaComponentsBackendApiRef);

  const organizationName =
    configApi.getOptionalString('organization.name') ?? 'Backstage';

  const { value: lastModifiedDate } = useAsync(async () => {
    return mcaApi.getCsvLastModifiedDate();
  }, [mcaApi]);

  const subtitle = `${organizationName} MCA Components Explorer`;

  const [selectedType, setSelectedType] = useState<McaComponentType>(() =>
    getInitialType(),
  );

  const handleSelectChange = (selected: string) => {
    const normalizedType = normalizeComponentType(selected);
    sessionStorage.setItem(STORAGE_KEY, normalizedType);
    setSelectedType(normalizedType);
  };

  return (
    <FullPage>
      <PluginHeader
        title="MCA Components"
        customActions={<InformationPopup text={subtitle} content={POPUP_CONTENT} />} />
      <Content>
        <Box mb="4">
          <Grid.Root columns="2">
            <Grid.Item>
              <Select
                onChange={selected => handleSelectChange(selected!.toString())}
                label="Type"
                options={componentTypes}
                value={selectedType}
              />
            </Grid.Item>
            <Grid.Item>
              <Flex
                style={{
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%',
                }}
              >
                <Alert
                  status="warning"
                  icon
                  title="Only MCA components promoted to PRD or those where P is &ge; to the current PRD P value are visible."
                  style={{ width: 'fit-content', alignSelf: 'flex-end' }}
                />
                <Alert
                  status="info"
                  icon
                  title={`Last updated: ${lastModifiedDate?.toLocaleString('fr-BE') || 'Unknown'}`}
                  style={{ width: 'fit-content', alignSelf: 'flex-end' }}
                />
              </Flex>
            </Grid.Item>
          </Grid.Root>
        </Box>
        <McaComponentTable type={selectedType} />
      </Content>
    </FullPage>
  );
};
