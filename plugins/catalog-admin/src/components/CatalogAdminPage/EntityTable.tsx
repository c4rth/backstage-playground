import { ANNOTATION_LOCATION, Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { toastApiRef, useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  catalogAdminTranslationRef,
  CatalogAdminTranslator,
} from '../../translation';
import { useState, useEffect, useRef } from 'react';
import {
  CellText,
  ColumnConfig,
  Table,
  useTable,
  Header,
  Button,
  Text,
  SortDescriptor,
  DialogTrigger,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Flex,
  Card,
  CardHeader,
  CardBody,
  Container,
} from '@backstage/ui';
import { CatalogApi, catalogApiRef } from '@backstage/plugin-catalog-react';
import { EntityFilterQuery } from '@backstage/catalog-client';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_LIBRARY_NAME,
  ANNOTATION_SERVICE_NAME,
  ANNOTATION_API_VERSION,
  ANNOTATION_LIBRARY_VERSION,
  ANNOTATION_SERVICE_VERSION,
  ANNOTATION_SERVICE_IMAGE_VERSION,
} from '@internal/plugin-api-platform-common';
import { RiDeleteBin6Line } from '@remixicon/react';
import { apiPlatformBackendApiRef } from '@internal/plugin-api-platform';

type TableRow = {
  id: number;
  name: string;
  system: string;
  version: string;
  entityName: string;
  location: string;
};

function getFilter(
  kind: string,
  system: string,
  t: CatalogAdminTranslator,
): EntityFilterQuery {
  if (kind === 'api') {
    return {
      kind: ['API'],
      'spec.system': system,
    };
  } else if (kind === 'library') {
    return {
      kind: ['Component'],
      'spec.type': ['library'],
      'spec.system': system,
    };
  } else if (kind === 'service') {
    return {
      kind: ['Component'],
      'spec.type': ['service'],
      'spec.system': system,
    };
  } else if (kind === 'techdocs') {
    return {
      kind: ['Component'],
      'spec.type': ['documentation'],
      'spec.system': system,
    };
  } else if (kind === 'template') {
    return {
      kind: ['Template'],
      'spec.system': system,
    };
  }
  throw new Error(t('table.unsupportedKind', { kind }));
}

function mapEntityToTableRow(
  kind: string,
  idx: number,
  entity: Entity,
  t: CatalogAdminTranslator,
): TableRow {
  if (kind === 'api') {
    return {
      id: idx,
      name:
        entity.metadata.annotations?.[ANNOTATION_API_NAME]?.toString() ?? '?',
      system: entity.spec?.system?.toString() ?? '-',
      version:
        entity.metadata?.annotations?.[ANNOTATION_API_VERSION]?.toString() ??
        '-',
      entityName: entity.metadata.name,
      location:
        entity.metadata?.annotations?.[ANNOTATION_LOCATION]?.toString() ?? '-',
    };
  } else if (kind === 'library') {
    return {
      id: idx,
      name:
        entity.metadata.annotations?.[ANNOTATION_LIBRARY_NAME]?.toString() ??
        '?',
      system: entity.spec?.system?.toString() ?? '-',
      version:
        entity.metadata?.annotations?.[
          ANNOTATION_LIBRARY_VERSION
        ]?.toString() ?? '-',
      entityName: entity.metadata.name,
      location:
        entity.metadata?.annotations?.[ANNOTATION_LOCATION]?.toString() ?? '-',
    };
  } else if (kind === 'service') {
    const names = [
      entity.metadata.annotations?.[ANNOTATION_SERVICE_NAME]?.toString() ?? '?',
      entity.metadata?.annotations?.[ANNOTATION_SERVICE_VERSION]?.toString() ??
        '?',
      entity.spec?.lifecycle?.toString() ?? '?',
    ];
    return {
      id: idx,
      name: names.join(' - '),
      system: entity.spec?.system?.toString() ?? '-',
      version:
        entity.metadata?.annotations?.[
          ANNOTATION_SERVICE_IMAGE_VERSION
        ]?.toString() ?? '?',
      entityName: entity.metadata.name,
      location:
        entity.metadata?.annotations?.[ANNOTATION_LOCATION]?.toString() ?? '-',
    };
  } else if (kind === 'techdocs') {
    return {
      id: idx,
      name: entity.metadata.name,
      system: entity.spec?.system?.toString() ?? '-',
      version: '-',
      entityName: entity.metadata.name,
      location:
        entity.metadata?.annotations?.[ANNOTATION_LOCATION]?.toString() ?? '-',
    };
  } else if (kind === 'template') {
    return {
      id: idx,
      name: entity.metadata.name,
      system: entity.spec?.system?.toString() ?? '-',
      version: '-',
      entityName: entity.metadata.name,
      location:
        entity.metadata?.annotations?.[ANNOTATION_LOCATION]?.toString() ?? '-',
    };
  }
  throw new Error(t('table.unsupportedKind', { kind }));
}

function sortItems(items: TableRow[], sort: SortDescriptor | null): TableRow[] {
  if (!sort) {
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  const { column, direction } = sort;
  return items.sort((a, b) => {
    const aValue = a[column as keyof TableRow];
    const bValue = b[column as keyof TableRow];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'ascending'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });
}

const getData = async (
  catalogApi: CatalogApi,
  kind: string,
  system: string,
  offset: number,
  pageSize: number,
  sort: SortDescriptor | null,
  t: CatalogAdminTranslator,
) => {
  const result = await catalogApi.getEntities({
    filter: getFilter(kind, system, t),
  });

  if (!result) {
    return { data: [], totalCount: 0, page: 0 };
  }

  let items = result.items.map((entity, idx) =>
    mapEntityToTableRow(kind, idx, entity, t),
  );
  items = sortItems(items, sort);

  const totalCount = items.length;
  const pageStart = offset;
  const pageLimit = pageSize;
  items = items.slice(pageStart, pageStart + pageLimit);
  return {
    data: items,
    totalCount,
  };
};

const getColumns = (t: CatalogAdminTranslator): ColumnConfig<TableRow>[] => [
  {
    id: 'name',
    label: t('table.columns.name'),
    width: '20%',
    isRowHeader: true,
    isSortable: true,
    cell: ({ name }: TableRow) => <CellText title={name || '-'} />,
  },
  {
    id: 'version',
    label: t('table.columns.version'),
    width: '10%',
    isSortable: true,
    cell: ({ version }: TableRow) => <CellText title={version || '-'} />,
  },
  {
    id: 'entityName',
    label: t('table.columns.entity'),
    width: '20%',
    cell: ({ entityName }: TableRow) => <CellText title={entityName || '-'} />,
  },
  {
    id: 'location',
    label: t('table.columns.location'),
    width: '45%',
    cell: ({ location }: TableRow) => <CellText title={location || '-'} />,
  },
];

export interface EntityTableProps {
  kind: string;
  system: string | null;
}

export const EntityTable = ({ kind, system }: EntityTableProps) => {
  const { t } = useTranslationRef(catalogAdminTranslationRef);
  const columns = getColumns(t);
  const titleKeys = {
    api: 'table.titles.api',
    library: 'table.titles.library',
    service: 'table.titles.service',
    techdocs: 'table.titles.techdocs',
    template: 'table.titles.template',
  } as const;
  const getTitle = () => {
    if (!(kind in titleKeys)) {
      throw new Error(t('table.unsupportedKind', { kind }));
    }
    return t(titleKeys[kind as keyof typeof titleKeys], {
      system: system ?? '?',
    });
  };
  const [selected, setSelected] = useState<Set<string | number> | 'all'>(
    new Set(),
  );
  const catalogApi = useApi(catalogApiRef);
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const toastApi = useApi(toastApiRef);
  const isFirstRender = useRef(true);
  const prevKindSystem = useRef({ kind, system });

  const fetchData = async (
    offset: number,
    pageSize: number,
    sort: SortDescriptor | null,
  ) => {
    const result = await getData(
      catalogApi,
      kind,
      system!,
      offset,
      pageSize,
      sort,
      t,
    );
    return result;
  };

  const { tableProps, reload } = useTable({
    mode: 'offset',
    getData: ({ offset, pageSize, sort }) => fetchData(offset, pageSize, sort),
    paginationOptions: {
      pageSize: 10,
      pageSizeOptions: [10, 20, 50],
    },
    initialSort: { column: 'name', direction: 'ascending' },
  });

  const getSelectedEntityNames = () => {
    if (selected === 'all') {
      return tableProps.data?.map(row => row.entityName) || [];
    }
    return (
      tableProps.data
        ?.filter(row => selected.has(row.id.toString()))
        .map(row => row.entityName) || []
    );
  };

  const deleteSelected = async () => {
    const entityNames = getSelectedEntityNames();
    const apiKind = kind === 'api' ? 'API' : 'Component';
    for (const entityName of entityNames) {
      try {
        await apiPlatformApi.unregisterEntity(apiKind, entityName);
        toastApi.post({
          title: t('table.delete.success', { entity: entityName }),
          status: 'success',
          timeout: 1500,
        });
      } catch (error) {
        toastApi.post({
          title: t('table.delete.error', {
            entity: entityName,
            error: String(error),
          }),
          status: 'danger',
          timeout: 1500,
        });
      }
    }
    setSelected(new Set());
    reload();
  };

  const refreshSelected = async () => {
    const entityNames = getSelectedEntityNames();
    const apiKind = kind === 'api' ? 'API' : 'Component';
    for (const entityName of entityNames) {
      try {
        await apiPlatformApi.refreshEntity(apiKind, entityName);
        toastApi.post({
          title: t('table.refresh.success', { entity: entityName }),
          status: 'success',
          timeout: 1500,
        });
      } catch (error) {
        toastApi.post({
          title: t('table.refresh.error', {
            entity: entityName,
            error: String(error),
          }),
          status: 'danger',
          timeout: 1500,
        });
      }
    }
    setSelected(new Set());
    reload();
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSelected(new Set());
    if (
      prevKindSystem.current.kind !== kind ||
      prevKindSystem.current.system !== system
    ) {
      prevKindSystem.current = { kind, system };
      reload();
    }
  }, [kind, system, reload]);

  return (
    <Container style={{ height: '100%' }}>
      <Card>
        <CardHeader>
          <Header
            title={getTitle()}
            sticky
            customActions={
              <>
                <DialogTrigger>
                  <Button
                    variant="primary"
                    iconStart={<RiDeleteBin6Line />}
                    isDisabled={
                      selected === 'all' ? false : selected.size === 0
                    }
                  >
                    {t('table.refresh.button', {
                      selection:
                        selected === 'all'
                          ? t('table.refresh.all')
                          : String(selected.size),
                    })}
                  </Button>
                  <Dialog>
                    <DialogHeader>{t('table.refresh.title')}</DialogHeader>
                    <DialogBody>
                      <Text>
                        {selected === 'all'
                          ? t('table.refresh.confirmAll')
                          : t('table.refresh.confirmItems', {
                              total: String(selected.size),
                            })}
                      </Text>
                      <Flex direction="column" mt="2" gap="1">
                        {getSelectedEntityNames().map(entityName => (
                          <Text key={entityName}>- {entityName}</Text>
                        ))}
                      </Flex>
                    </DialogBody>
                    <DialogFooter>
                      <Button variant="secondary" slot="close">
                        {t('table.refresh.cancel')}
                      </Button>
                      <Button
                        destructive
                        variant="primary"
                        slot="close"
                        onClick={refreshSelected}
                      >
                        {t('table.refresh.action')}
                      </Button>
                    </DialogFooter>
                  </Dialog>
                </DialogTrigger>
                <DialogTrigger>
                  <Button
                    destructive
                    variant="primary"
                    iconStart={<RiDeleteBin6Line />}
                    isDisabled={
                      selected === 'all' ? false : selected.size === 0
                    }
                  >
                    {t('table.delete.button', {
                      selection:
                        selected === 'all'
                          ? t('table.delete.all')
                          : String(selected.size),
                    })}
                  </Button>
                  <Dialog>
                    <DialogHeader>{t('table.delete.title')}</DialogHeader>
                    <DialogBody>
                      <Text>
                        {selected === 'all'
                          ? t('table.delete.confirmAll')
                          : t('table.delete.confirmItems', {
                              total: String(selected.size),
                            })}
                      </Text>
                      <Flex direction="column" mt="2" gap="1">
                        {getSelectedEntityNames().map(entityName => (
                          <Text key={entityName}>- {entityName}</Text>
                        ))}
                      </Flex>
                    </DialogBody>
                    <DialogFooter>
                      <Button variant="secondary" slot="close">
                        {t('table.delete.cancel')}
                      </Button>
                      <Button
                        destructive
                        variant="primary"
                        slot="close"
                        onClick={deleteSelected}
                      >
                        {t('table.delete.action')}
                      </Button>
                    </DialogFooter>
                  </Dialog>
                </DialogTrigger>
              </>
            }
          />
        </CardHeader>
        <CardBody>
          <Table
            key={`table-${kind}`}
            {...tableProps}
            columnConfig={columns}
            selection={{
              mode: 'multiple',
              behavior: 'toggle',
              selected,
              onSelectionChange: setSelected,
            }}
            emptyState={<div>{t('table.empty')}</div>}
            className="denseTable"
          />
        </CardBody>
      </Card>
    </Container>
  );
};
