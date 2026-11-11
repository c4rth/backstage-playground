import { useApi } from '@backstage/core-plugin-api';
import {
  useStoredValue,
  useDocumentTitle,
} from '@internal/plugin-components-react';
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
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { mcaTranslationRef } from '../../translation';

const STORAGE_KEY = 'mcaComponentExplorerPageType';
const DEFAULT_TYPE = 'operation';

function normalizeComponentType(type: string): McaComponentType {
  const validTypes = ['operation', 'element', 'all'] as const;
  return validTypes.includes(type as McaComponentType)
    ? (type as McaComponentType)
    : DEFAULT_TYPE;
}

export const McaComponentExplorerPage = () => {
  const { t } = useTranslationRef(mcaTranslationRef);
  useDocumentTitle(t('componentExplorer.title'));
  const componentTypes: Option[] = [
    { label: t('componentExplorer.operations'), id: 'operation' },
    { label: t('componentExplorer.elements'), id: 'element' },
    { label: t('componentExplorer.allComponents'), id: 'all' },
  ];
  const mcaApi = useApi(mcaComponentsBackendApiRef);

  const { value: lastModifiedDate } = useAsync(async () => {
    return mcaApi.getCsvLastModifiedDate();
  }, [mcaApi]);

  const { initialValue: selectedType, storeValue: setSelectedType } =
    useStoredValue<McaComponentType>(STORAGE_KEY, DEFAULT_TYPE);

  const handleSelectChange = (selected: string) => {
    const normalizedType = normalizeComponentType(selected);
    setSelectedType(normalizedType);
  };

  return (
    <>
      <PluginHeader
        title={t('componentExplorer.title')}
        icon={<RiBubbleChartLine fontSize="inherit" />}
        customActions={
          <InformationPopup
            content={
              <InformationPopupContent
                text={t('componentExplorer.description')}
                comment={t('componentExplorer.purpose')}
              />
            }
          />
        }
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
                  label={t('componentExplorer.type')}
                  options={componentTypes}
                  value={selectedType}
                  aria-label={t('componentExplorer.type')}
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
                    title={t('componentExplorer.visibility')}
                    style={{ width: 'fit-content', alignSelf: 'flex-end' }}
                  />
                  <Alert
                    status="info"
                    icon
                    title={t('componentExplorer.lastUpdated', {
                      date:
                        lastModifiedDate?.toLocaleString('fr-BE') ||
                        t('componentExplorer.unknownDate'),
                    })}
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
