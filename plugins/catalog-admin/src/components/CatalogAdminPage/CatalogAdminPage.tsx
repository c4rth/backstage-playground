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
import { toastApiRef, useTranslationRef } from '@backstage/frontend-plugin-api';
import { catalogAdminTranslationRef } from '../../translation';
import { CATALOG_METADATA_NAME } from '@internal/plugin-api-platform-common';
import { EntityValidationContent } from '@backstage-community/plugin-entity-validation';
import { ImportStepper } from '@backstage/plugin-catalog-import';

export const CatalogAdminPage = () => {
  const { t } = useTranslationRef(catalogAdminTranslationRef);
  const kindOptions = [
    { label: t('page.filters.api'), id: 'api' },
    { label: t('page.filters.library'), id: 'library' },
    { label: t('page.filters.service'), id: 'service' },
    { label: t('page.filters.techdocs'), id: 'techdocs' },
    { label: t('page.filters.template'), id: 'template' },
  ];
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
          title: t('page.loadSystemsError', { error: String(err) }),
          status: 'danger',
          timeout: 1500,
        });
      });
  }, [catalogApi, toastApi, t]);

  return (
    <Container>
      <Tabs>
        <TabList>
          <Tab id="tab1">{t('page.tabs.catalog')}</Tab>
          <Tab id="tab2">{t('page.tabs.import')}</Tab>
          <Tab id="tab3">{t('page.tabs.validation')}</Tab>
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
                  label={t('page.filters.system')}
                  options={systemOptions}
                  value={system ?? ''}
                  aria-label={t('page.filters.system')}
                />
              </Grid.Item>
              <Grid.Item>
                <Select
                  onChange={selected => {
                    setKind(selected!.toString());
                  }}
                  label={t('page.filters.kind')}
                  options={kindOptions}
                  value={kind.toString()}
                  aria-label={t('page.filters.kind')}
                />
              </Grid.Item>
            </Grid.Root>
            {!system && <p>{t('page.selectSystem')}</p>}
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
