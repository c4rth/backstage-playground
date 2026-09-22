import { useApi } from '@backstage/core-plugin-api';
import { useStoredValue } from '@internal/plugin-components-react';
import { McaComponentTable } from '../McaComponentTable';
import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-components-react';
import { McaComponentType } from '@internal/plugin-mca-common';
import {
  Alert,
  Box,
  Flex,
  Grid,
  Select,
  Option,
  FullPage,
  PluginHeader,
  Container,
} from '@backstage/ui';
import { mcaComponentsBackendApiRef } from '../../api';
import useAsync from 'react-use/esm/useAsync';
import { RiBubbleChartLine } from '@remixicon/react';

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

function normalizeComponentType(type: string): McaComponentType {
  const validTypes = ['operation', 'element', 'all'] as const;
  return validTypes.includes(type as McaComponentType)
    ? (type as McaComponentType)
    : DEFAULT_TYPE;
}

export const McaComponentExplorerPage = () => {
  const mcaApi = useApi(mcaComponentsBackendApiRef);

  const { value: lastModifiedDate } = useAsync(async () => {
    return mcaApi.getCsvLastModifiedDate();
  }, [mcaApi]);

  const { initialValue: selectedType, storeValue: setSelectedType } = useStoredValue<McaComponentType>(STORAGE_KEY, DEFAULT_TYPE);

  const handleSelectChange = (selected: string) => {
    const normalizedType = normalizeComponentType(selected);
    setSelectedType(normalizedType);
  };

  return (
    <>
      <PluginHeader
        title="MCA Components"
        icon={<RiBubbleChartLine fontSize="inherit" />}
        customActions={<InformationPopup content={POPUP_CONTENT} />}
      />
      <FullPage>
        <Container>
          <Box mb="4">
            <Grid.Root columns="3">
              <Grid.Item>
                <Select
                  onChange={selected =>
                    handleSelectChange(selected!.toString())
                  }
                  label="Type"
                  options={componentTypes}
                  value={selectedType}
                  aria-label="Type"
                />
              </Grid.Item>
              <Grid.Item colSpan="2">
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
          <McaComponentTable type={selectedType as McaComponentType} />
        </Container>
      </FullPage>
    </>
  );
};
