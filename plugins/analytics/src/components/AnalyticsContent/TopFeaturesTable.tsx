import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CellText,
  Cell,
  ColumnConfig,
  Table,
  Text,
  useTable,
} from '@backstage/ui';
import styles from './AnalyticsContent.module.css';
import { TopFeature } from '../../api/CustomAnalyticsApi';

export type TableRow = {
  id: number;
  featureName: string;
  uniqueVisitors: number;
  totalHits: number;
};

export const toRow = (feature: TopFeature, idx: number): TableRow => ({
  id: idx,
  featureName: feature.featureName,
  uniqueVisitors: feature.uniqueVisitors,
  totalHits: feature.totalHits,
});

const centerStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
} as const;

const columns: ColumnConfig<TableRow>[] = [
  {
    id: 'featureName',
    label: 'Feature Name',
    isRowHeader: true,
    isSortable: true,
    cell: item => <CellText title={item.featureName} />,
  },
  {
    id: 'uniqueVisitors',
    label: 'Unique Visitors',
    isSortable: true,
    cell: item => (
      <Cell>
        <Box style={centerStyle}>{item.uniqueVisitors}</Box>
      </Cell>
    ),
  },
  {
    id: 'totalHits',
    label: 'Total Hits',
    isSortable: true,
    cell: item => (
      <Cell>
        <Box style={centerStyle}>{item.totalHits}</Box>
      </Cell>
    ),
  },
];

export const TopFeaturesTable = ({ data }: { data: TableRow[] }) => {
  const { tableProps } = useTable({
    mode: 'complete',
    data,
    paginationOptions: {
      type: 'none',
    },
    initialSort: {
      column: 'totalHits',
      direction: 'descending',
    },
    sortFn: (items, { column, direction }) => {
      return [...items].sort((a, b) => {
        const desc = direction === 'descending' ? -1 : 1;
        switch (column) {
          case 'featureName':
            return desc * a.featureName.localeCompare(b.featureName);
          case 'totalHits':
            return desc * (a.totalHits - b.totalHits);
          case 'uniqueVisitors':
            return desc * (a.uniqueVisitors - b.uniqueVisitors);
          default:
            return 0;
        }
      });
    },
  });

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader>
        <Text variant="title-x-small">
          Top features by unique visitors ({data.length})
        </Text>
      </CardHeader>
      <CardBody style={{ flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
        {data.length === 0 ? (
          <p>No feature navigation data yet.</p>
        ) : (
          <Box style={{ height: '100%', overflow: 'auto' }}>
            <Table
              columnConfig={columns}
              {...tableProps}
              className={styles.denseTable}
            />
          </Box>
        )}
      </CardBody>
    </Card>
  );
};
