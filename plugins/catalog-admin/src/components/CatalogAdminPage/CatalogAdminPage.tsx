import {
  Box,
  Container,
  Grid,
  Select,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from '@backstage/ui';
import { useState, useEffect } from 'react';
import { EntityTable } from './EntityTable';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import { CATALOG_METADATA_NAME } from '@internal/plugin-api-platform-common';
import { EntityValidationContent } from '@backstage-community/plugin-entity-validation';
import { ImportStepper } from '@backstage/plugin-catalog-import';

const kindOptions = [
  { label: 'API', id: 'api' },
  { label: 'Library', id: 'library' },
  { label: 'Service', id: 'service' },
  { label: 'TechDocs', id: 'techdocs' },
  { label: 'Template', id: 'template' },
];

export const CatalogAdminPage = () => {
  const [kind, setKind] = useState('api');
  const [system, setSystem] = useState<string | null>(null);
  const [systemOptions, setSystemOptions] = useState<
    { label: string; id: string }[]
  >([]);

  const catalogApi = useApi(catalogApiRef);
  const toastApi = useApi(toastApiRef);

  useEffect(() => {
    catalogApi
      .getEntities({
        fields: [CATALOG_METADATA_NAME],
        filter: {
          kind: ['System'],
        },
        order: {
          field: CATALOG_METADATA_NAME,
          order: 'asc',
        },
      })
      .then(result => {
        const loaded = result.items.map(entity => ({
          label: entity.metadata.name,
          id: entity.metadata.name,
        }));
        setSystemOptions(loaded);
      })
      .catch(err => {
        toastApi.post({
          title: `Failed to load systems: ${err}`,
          status: 'danger',
          timeout: 1500,
        });
      });
  }, [catalogApi, toastApi]);

  return (
    <Container>
      <Tabs>
        <TabList>
          <Tab id="tab1">Catalog</Tab>
          <Tab id="tab2">Import</Tab>
          <Tab id="tab3">Entity Validation</Tab>
        </TabList>
        <TabPanel id="tab1">
          <>
            <Grid.Root columns="2" gap="10" mt="4" mb="4">
              <Grid.Item>
                <Select
                  onChange={selected => {
                    setSystem(selected ? selected.toString() : null);
                  }}
                  search
                  label="System"
                  options={systemOptions}
                  value={system ?? ''}
                />
              </Grid.Item>
              <Grid.Item>
                <Select
                  onChange={selected => {
                    setKind(selected!.toString());
                  }}
                  label="Kind"
                  options={kindOptions}
                  value={kind.toString()}
                />
              </Grid.Item>
            </Grid.Root>
            {!system && (
              <p>
                Please select a system to view the entities associated with it.
              </p>
            )}
            {system && system !== '' && (
              <EntityTable kind={kind} system={system} />
            )}
          </>
        </TabPanel>
        <TabPanel id="tab2">
          <Box mt="4">
            <ImportStepper />
          </Box>
        </TabPanel>
        <TabPanel id="tab3">
          <Box mt="4" style={{ height: '80vh' }}>
            <EntityValidationContent />
          </Box>
        </TabPanel>
      </Tabs>
    </Container>
  );
};
