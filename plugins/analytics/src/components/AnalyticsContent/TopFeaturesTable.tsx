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
  Column,
} from '@backstage/ui';
import { TopFeature } from '../../api/CustomAnalyticsApi';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  analyticsTranslationRef,
  AnalyticsTranslator,
} from '../../translation';

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

const getColumns = (t: AnalyticsTranslator): ColumnConfig<TableRow>[] => [
  {
    id: 'featureName',
    label: t('topFeatures.columns.featureName'),
    isRowHeader: true,
    isSortable: true,
    cell: item => <CellText title={item.featureName} />,
  },
  {
    id: 'uniqueVisitors',
    label: t('topFeatures.columns.uniqueVisitors'),
    isSortable: true,
    cell: item => (
      <Cell>
        <Box style={centerStyle}>{item.uniqueVisitors}</Box>
      </Cell>
    ),
    header: () => (
      <Column id="uniqueVisitors" className="centered-col-header" allowsSorting>
        <Text weight="bold">{t('topFeatures.columns.uniqueVisitors')}</Text>
      </Column>
    ),
  },
  {
    id: 'totalHits',
    label: t('topFeatures.columns.totalHits'),
    isSortable: true,
    cell: item => (
      <Cell>
        <Box style={centerStyle}>{item.totalHits}</Box>
      </Cell>
    ),
    header: () => (
      <Column id="totalHits" className="centered-col-header" allowsSorting>
        <Text weight="bold">{t('topFeatures.columns.totalHits')}</Text>
      </Column>
    ),
  },
];

export const TopFeaturesTable = ({ data }: { data: TableRow[] }) => {
  const { t } = useTranslationRef(analyticsTranslationRef);
  const columns = getColumns(t);
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
          {t('topFeatures.title', { total: String(data.length) })}
        </Text>
      </CardHeader>
      <CardBody style={{ flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
        {data.length === 0 ? (
          <p>{t('topFeatures.empty')}</p>
        ) : (
          <Table
            columnConfig={columns}
            {...tableProps}
            className="denseTable"
          />
        )}
      </CardBody>
    </Card>
  );
};
