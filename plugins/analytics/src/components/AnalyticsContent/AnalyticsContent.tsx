import { useApi } from '@backstage/core-plugin-api';
import { useEffect, useState } from 'react';
import { analyticsBackendApiRef } from '../../api';
import { Box, Container, Flex, Select } from '@backstage/ui';
import { DailyVisitor } from '../../api/CustomAnalyticsApi';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { DailyUsersChart } from './DailyUsersChart';
import { TopFeaturesTable, TableRow, toRow } from './TopFeaturesTable';

const daysToShowOptions = [
  { label: 'Today', id: '0' },
  { label: 'Last 24 hours', id: '1' },
  { label: 'Last 7 days', id: '7' },
  { label: 'Last 14 days', id: '14' },
  { label: 'Last 30 days', id: '30' },
];

export const AnalyticsContent = () => {
  const analyticsApi = useApi(analyticsBackendApiRef);
  const [dailyUniqueVisitors, setDailyUniqueVisitors] = useState<
    DailyVisitor[]
  >([]);
  const [topFeatures, setTopFeatures] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [daysToShow, setDaysToShow] = useState(7);

  useEffect(() => {
    let isMounted = true;

    const loadMetrics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [count, features] = await Promise.all([
          analyticsApi.getDailyUniqueUsers(daysToShow),
          analyticsApi.getTopFeatures(100, daysToShow),
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

  return (
    <Container>
      {isLoading && <Progress />}
      {error && (
        <ResponseErrorPanel title="Failed to call AppRegistry" error={error} />
      )}

      {!isLoading && !error && (
        <Flex direction="column" style={{ height: 'calc(100vh - 200px)' }}>
          <Box style={{ flexShrink: 0, marginBottom: '16px' }}>
            <Select
              onChange={selected => {
                setDaysToShow(parseInt(selected?.toString() ?? '0', 10));
              }}
              label="Date Range"
              options={daysToShowOptions}
              value={daysToShow.toString()}
            />
          </Box>
          <Box style={{ flex: '0 0 25%', minHeight: 0 }}>
            <DailyUsersChart data={dailyUniqueVisitors} />
          </Box>
          <Box style={{ flex: 1, minHeight: 0 }}>
            <TopFeaturesTable data={topFeatures} />
          </Box>
        </Flex>
      )}
    </Container>
  );
};
