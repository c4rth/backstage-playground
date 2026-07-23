import {
  Box,
  Text,
  Table,
  useTable,
  ColumnConfig,
  Cell,
  Container,
  Header,
  SearchField,
} from '@backstage/ui';
import { memo, useMemo } from 'react';
import styles from './McaComponentTable.module.css';

export interface McaComponentMethodsTabProps {
  data: any;
  componentType?: 'element' | 'operation';
}

type MethodRow = {
  id: number;
  name: string;
};

const columns: ColumnConfig<MethodRow>[] = [
  {
    label: 'Method Name',
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
    const methods = useMemo(() => getMethods(data), [data]);

    const { tableProps, search } = useTable({
      mode: 'complete',
      getData: () => methods,
      sortFn: (items, { column, direction }) => {
        return [...items].sort((a, b) => {
          const desc = direction === 'descending' ? -1 : 1;
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
      <Container>
        <Header
          title={`Implemented Methods (${methods.length})`}
          customActions={
            <Box style={{ marginLeft: 'auto', width: '250px' }}>
              <SearchField
                placeholder="Filter..."
                value={search.value}
                onChange={str => {
                  search.onChange(str);
                }}
                aria-label="Filter"
              />
            </Box>
          }
        />
        <Table
          key={`table-${componentType}`}
          {...tableProps}
          columnConfig={columns}
          emptyState={
            <div>No implemented methods found for this {componentType}.</div>
          }
          className={styles.denseTable}
        />
      </Container>
    );
  },
);
