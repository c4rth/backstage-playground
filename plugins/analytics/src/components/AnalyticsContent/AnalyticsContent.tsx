import { useApi } from '@backstage/core-plugin-api';
import { useEffect, useState } from 'react';
import { analyticsBackendApiRef } from '../../api';
import { Box, Card, CardBody, CardHeader, CellText, Cell, ColumnConfig, Table, Text, useTable } from '@backstage/ui';
import styles from './AnalyticsContent.module.css';
import { DailyVisitor, TopFeature } from '../../api/CustomAnalyticsApi';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Progress, ResponseErrorPanel, Select } from '@backstage/core-components';

type TableRow = {
  id: number;
  featureName: string;
  uniqueVisitors: number;
  totalHits: number;
};

const toRow = (feature: TopFeature, idx: number): TableRow => ({
  id: idx,
  featureName: feature.featureName,
  uniqueVisitors: feature.uniqueVisitors,
  totalHits: feature.totalHits,
});

const centerStyle = { width: '100%', display: 'flex', justifyContent: 'center' } as const;

const columns: ColumnConfig<TableRow>[] = [
  {
    id: 'featureName',
    label: 'Feature Name',
    isRowHeader: true,
    cell: item => <CellText title={item.featureName} />
  },
  {
    id: 'uniqueVisitors',
    label: 'Unique Visitors',
    isSortable: true,
    cell: item => (
      <Cell>
        <Box style={centerStyle}>{item.uniqueVisitors}</Box>
      </Cell>
    )
  },
  {
    id: 'totalHits',
    label: 'Total Hits',
    isSortable: true,
    cell: item => (
      <Cell>
        <Box style={centerStyle}>{item.totalHits}</Box>
      </Cell>
    )
  },
];

const daysToShowOptions = [
  { label: 'Today', value: '0' },
  { label: 'Last 24 hours', value: '1' },
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 14 days', value: '14' },
  { label: 'Last 30 days', value: '30' },
];

export const AnalyticsContent = () => {
  const analyticsApi = useApi(analyticsBackendApiRef);
  const [dailyUniqueVisitors, setDailyUniqueVisitors] = useState<DailyVisitor[]>([]);
  const [topFeatures, setTopFeatures] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [daysToShow, setDaysToShow] = useState(0);

  const { tableProps } = useTable({
    mode: 'complete',
    data: topFeatures,
    paginationOptions: {
      type: 'none',
    },
    initialSort: {
      column: 'totalHits',
      direction: 'descending',
    },
    sortFn: (items, {
      column,
      direction
    }) => {
      return [...items].sort((a, b) => {
        const desc = direction === 'descending' ? -1 : 1;
        switch (column) {
          case 'totalHits':
            return desc * (a.totalHits - b.totalHits);
          case 'uniqueVisitors':
            return desc * (a.uniqueVisitors - b.uniqueVisitors);
          default:
            return 0;
        }
      });
    }
  });

  useEffect(() => {
    let isMounted = true;

    const loadMetrics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [count, features] = await Promise.all([
          analyticsApi.getDailyUniqueUsers(daysToShow),
          analyticsApi.getTopFeatures(10, daysToShow),
        ]);

        if (!isMounted) {
          return;
        }

        setDailyUniqueVisitors(count);
        setTopFeatures(features.map(toRow));
      } catch (e) {
        if (!isMounted) {
          return;
        }

        setError(new Error('Failed to load analytics metrics'));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMetrics();

    return () => {
      isMounted = false;
    };
  }, [analyticsApi, daysToShow]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [_year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  return (

    <Box>
      {isLoading && <Progress />}
      {error && <ResponseErrorPanel title="Failed to call AppRegistry" error={error} />}

      {!isLoading && !error && (
        <>
          <Box>
            <Select onChange={(selected) => {
              setDaysToShow(parseInt(selected.toString(), 10));
            }} label="Date Range" items={daysToShowOptions} selected={daysToShow.toString()} />
          </Box>
          <Card style={{ marginBottom: '16px' }}>
            <CardHeader><Text variant='title-x-small'>Daily unique users</Text></CardHeader>
            <CardBody>
              {dailyUniqueVisitors.length === 0 ? (
                <p>No daily unique user data yet.</p>
              ) : (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={dailyUniqueVisitors}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDisplayDate}
                      />
                      <YAxis
                        allowDecimals={false}
                        domain={[0, (dataMax) => Math.max(2, Math.ceil(dataMax))]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bui-bg)', color: 'var(--bui-text-primary)' }}
                        labelFormatter={(label) => `Date: ${formatDisplayDate(label)}`}
                      />
                      <Bar
                        dataKey="visitors"
                        fill="var(--bui-bg-solid)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><Text variant='title-x-small'>Top features by unique visitors</Text></CardHeader>
            <CardBody>
              {topFeatures.length === 0 ? (
                <p>No feature navigation data yet.</p>
              ) : (
                <Table
                  columnConfig={columns}
                  {...tableProps}
                  className={styles.denseTable}
                />
              )}
            </CardBody>
          </Card>
        </>
      )
      }
    </Box >

  );
};