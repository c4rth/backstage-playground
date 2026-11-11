import {
  Text,
  Table,
  useTable,
  ColumnConfig,
  Cell,
  Header,
  SearchField,
  CardBody,
  Card,
  CardHeader,
} from '@backstage/ui';
import { memo, useMemo } from 'react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { mcaTranslationRef, McaTranslator } from '../../translation';

export interface McaComponentMethodsTabProps {
  data: any;
  componentType?: 'element' | 'operation';
}

type MethodRow = {
  id: number;
  name: string;
};

const getColumns = (t: McaTranslator): ColumnConfig<MethodRow>[] => [
  {
    label: t('methods.name'),
    width: '100%',
    id: 'name',
    isRowHeader: true,
    isSortable: true,
    cell: row => (
      <Cell>
        <Text weight="bold">{row.name}</Text>
      </Cell>
    ),
  },
];

function transformMethodsToRows(methods: any[]): MethodRow[] {
  if (!Array.isArray(methods)) {
    return [];
  }
  return methods
    .filter(method => method?.name?.trim())
    .map((method, index) => ({
      id: index,
      name: method.name.trim(),
    }));
}

function getMethods(data: any): MethodRow[] {
  const implementedMethods = data?.implementedMethods?.implementedMethod;

  if (!implementedMethods) {
    return [];
  }

  const methodsArray = Array.isArray(implementedMethods)
    ? implementedMethods
    : [implementedMethods];

  return transformMethodsToRows(methodsArray);
}

export const McaComponentMethodsTab = memo<McaComponentMethodsTabProps>(
  ({ data, componentType = 'element' }) => {
    const { t } = useTranslationRef(mcaTranslationRef);
    const columns = getColumns(t);
    const methods = useMemo(() => getMethods(data), [data]);

    const { tableProps, search } = useTable({
      mode: 'complete',
      getData: () => methods,
      sortFn: (items, { column, direction }) => {
        const desc = direction === 'descending' ? -1 : 1;
        return [...items].sort((a, b) => {
          switch (column) {
            case 'name':
              return desc * a.name.localeCompare(b.name);
            default:
              return 0;
          }
        });
      },
      searchFn: (items, query) => {
        const lowerQuery = query.toLowerCase();
        return items.filter(item =>
          item.name.toLowerCase().includes(lowerQuery),
        );
      },
    });

    return (
      <Card>
        <CardHeader>
          <Header
            title={t('methods.title', { total: String(methods.length) })}
            customActions={
              <SearchField
                placeholder={t('methods.filterPlaceholder')}
                value={search.value}
                onChange={str => {
                  search.onChange(str);
                }}
                aria-label={t('methods.filterLabel')}
                startCollapsed
                size="medium"
              />
            }
          />
        </CardHeader>
        <CardBody>
          <Table
            key={`table-${componentType}`}
            {...tableProps}
            columnConfig={columns}
            emptyState={
              <div>
                {t(
                  componentType === 'element'
                    ? 'methods.emptyElement'
                    : 'methods.emptyOperation',
                )}
              </div>
            }
            className="denseTable"
          />
        </CardBody>
      </Card>
    );
  },
);
