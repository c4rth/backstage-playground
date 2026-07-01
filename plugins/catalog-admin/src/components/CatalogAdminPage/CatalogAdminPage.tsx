import {
  Container,
  FullPage,
  Grid,
  Select,
} from '@backstage/ui';
import { useState, useEffect } from 'react';
import { EntityTable } from './EntityTable';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { CATALOG_METADATA_NAME } from '@internal/plugin-api-platform-common';

const kindOptions = [
  { label: 'API', id: 'api' },
  { label: 'Library', id: 'library' },
  { label: 'Service', id: 'service' },
  { label: 'TechDocs', id: 'techdocs' },
];

export const CatalogAdminPage = () => {
  const [kind, setKind] = useState('api');
  const [system, setSystem] = useState<string | null>(null);
  const [systemOptions, setSystemOptions] = useState<{ label: string; id: string }[]>([]);

  const catalogApi = useApi(catalogApiRef);

  useEffect(() => {

    catalogApi.getEntities({
      fields: [
        CATALOG_METADATA_NAME,
      ],
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
        console.error('Failed to load systems', err);
      });
  }, [catalogApi]);

  return (
    <FullPage>
      <Container>
        <Grid.Root columns="2" gap="4" mb="4">
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
      </Container>
    </FullPage>
  );
};
