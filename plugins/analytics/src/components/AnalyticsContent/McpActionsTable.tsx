import {
  Card,
  CardBody,
  CardHeader,
  CellText,
  ColumnConfig,
  Table,
  Text,
  useTable,
  Column,
  Cell,
  Box,
} from '@backstage/ui';
import { McpActionMetric } from '../../api/AnalyticsBackendApi';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  analyticsTranslationRef,
  AnalyticsTranslator,
} from '../../translation';

type Row = McpActionMetric & { id: string };

const centerStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
} as const;

const getColumns = (t: AnalyticsTranslator): ColumnConfig<Row>[] => [
  {
    id: 'toolName',
    label: t('mcpActions.columns.toolName'),
    isRowHeader: true,
    isSortable: true,
    cell: item => <CellText title={item.toolName} />,
  },
  {
    id: 'succeeded',
    label: t('mcpActions.columns.succeeded'),
    isSortable: true,
    cell: item => (
      <Cell>
        <Box style={centerStyle}>{item.succeeded}</Box>
      </Cell>
    ),
    header: () => (
      <Column id="succeeded" className="centered-col-header" allowsSorting>
        <Text weight="bold">{t('mcpActions.columns.succeeded')}</Text>
      </Column>
    ),
  },
  {
    id: 'failed',
    label: t('mcpActions.columns.failed'),
    isSortable: true,
    cell: item => (
      <Cell>
        <Box style={centerStyle}>{item.failed}</Box>
      </Cell>
    ),
    header: () => (
      <Column id="failed" className="centered-col-header" allowsSorting>
        <Text weight="bold">{t('mcpActions.columns.failed')}</Text>
      </Column>
    ),
  },
];

export const McpActionsTable = ({ data }: { data: McpActionMetric[] }) => {
  const { t } = useTranslationRef(analyticsTranslationRef);
  const columns = getColumns(t);
  const { tableProps } = useTable({
    mode: 'complete',
    data: data.map(item => ({
      ...item,
      id: item.toolName,
    })),
    paginationOptions: { type: 'none' },
    initialSort: {
      column: 'toolName',
      direction: 'ascending',
    },
    sortFn: (items, { column, direction }) => {
      return [...items].sort((a, b) => {
        const desc = direction === 'descending' ? -1 : 1;
        switch (column) {
          case 'toolName':
            return desc * a.toolName.localeCompare(b.toolName);
          case 'succeeded':
            return desc * (a.succeeded - b.succeeded);
          case 'failed':
            return desc * (a.failed - b.failed);
          default:
            return 0;
        }
      });
    },
  });
  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader>
        <Text variant="title-x-small">{t('mcpActions.title')}</Text>
      </CardHeader>
      <CardBody style={{ flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
        {data.length === 0 ? (
          <p>{t('mcpActions.empty')}</p>
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
