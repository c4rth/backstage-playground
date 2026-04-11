import { useApi } from '@backstage/core-plugin-api';
import { useEffect, useState } from 'react';
import { analyticsBackendApiRef } from '../../api';
import { Box, Card, CardBody, CardHeader, CellText, ColumnConfig, Table, Text, useTable } from '@backstage/ui';
import styles from './AnalyticsContent.module.css';

type TableRow = {
  id: number;
  featureName: string;
  uniqueVisitors: number;
};

const columns: ColumnConfig<TableRow>[] = [
  { id: 'featureName', label: 'Feature Name', isRowHeader: true, cell: item => <CellText title={item.featureName} /> },
  { id: 'uniqueVisitors', label: 'Unique Visitors', cell: item => <CellText title={item.uniqueVisitors.toString()} /> },
];

export const AnalyticsContent = () => {
  const analyticsApi = useApi(analyticsBackendApiRef);
  const [dailyUniqueUsers, setDailyUniqueUsers] = useState<number | null>(null);
  const [topFeatures, setTopFeatures] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { tableProps } = useTable({
    mode: 'complete',
    data: topFeatures,
    paginationOptions: {
      type: 'none',
    },
  });

  useEffect(() => {
    let isMounted = true;

    const loadMetrics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [count, features] = await Promise.all([
          analyticsApi.getDailyUniqueUsers(),
          analyticsApi.getTopFeatures(),
        ]);

        if (!isMounted) {
          return;
        }

        setDailyUniqueUsers(count);
        setTopFeatures(features.map((feature, idx) => ({
          id: idx,
          featureName: feature.featureName,
          uniqueVisitors: feature.uniqueVisitors,
        })));
      } catch (e) {
        if (!isMounted) {
          return;
        }

        setError('Failed to load analytics metrics');
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
  }, [analyticsApi]);

  return (

    <Box>
      {isLoading && <p>Loading analytics metrics...</p>}
      {error && <p>{error}</p>}

      {!isLoading && !error && (
        <>
          <Card style={{ marginBottom: '16px' }}>
            <CardHeader><Text variant='title-x-small'>Daily unique users</Text></CardHeader>
            <CardBody><Text variant='title-x-small' weight='bold' color='success' style={{ marginLeft: '16px'}}>{dailyUniqueUsers ?? 0}</Text></CardBody>
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