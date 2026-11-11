import { useApi } from '@backstage/core-plugin-api';
import { useEffect, useState } from 'react';
import { analyticsBackendApiRef } from '../../api';
import {
  Box,
  Container,
  Flex,
  Select,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from '@backstage/ui';
import { DailyVisitor } from '../../api/CustomAnalyticsApi';
import { ResponseErrorPanel } from '@backstage/core-components';
import { DailyUsersChart } from './DailyUsersChart';
import { TopFeaturesTable, TableRow, toRow } from './TopFeaturesTable';
import { Progress } from '@internal/plugin-components-react';
import { McpActionMetric } from '../../api/AnalyticsBackendApi';
import { McpActionsTable } from './McpActionsTable';
import styles from './AnalyticsContent.module.css';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { analyticsTranslationRef } from '../../translation';

export const AnalyticsContent = () => {
  const { t } = useTranslationRef(analyticsTranslationRef);
  const daysToShowOptions = [
    { label: t('content.today'), id: '0' },
    { label: t('content.lastDay'), id: '1' },
    { label: t('content.lastWeek'), id: '7' },
    { label: t('content.lastTwoWeeks'), id: '14' },
    { label: t('content.lastMonth'), id: '30' },
  ];
  const analyticsApi = useApi(analyticsBackendApiRef);
  const [dailyUniqueVisitors, setDailyUniqueVisitors] = useState<
    DailyVisitor[]
  >([]);
  const [topFeatures, setTopFeatures] = useState<TableRow[]>([]);
  const [mcpActions, setMcpActions] = useState<McpActionMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [daysToShow, setDaysToShow] = useState(7);

  useEffect(() => {
    let isMounted = true;

    const loadMetrics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [count, features, actions] = await Promise.all([
          analyticsApi.getDailyUniqueUsers(daysToShow),
          analyticsApi.getTopFeatures(100, daysToShow),
          analyticsApi.getMcpActions(daysToShow),
        ]);

        if (!isMounted) {
          return;
        }

        setDailyUniqueVisitors(count);
        setTopFeatures(features.map(toRow));
        setMcpActions(actions);
      } catch (e) {
        if (!isMounted) {
          return;
        }

        setError(new Error(t('content.loadError')));
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
  }, [analyticsApi, daysToShow, t]);

  return (
    <Container className={styles.container}>
      {isLoading && <Progress />}
      {error && (
        <ResponseErrorPanel title={t('content.apiError')} error={error} />
      )}

      {!isLoading && !error && (
        <Flex direction="column" style={{ height: '100%', minHeight: 0 }}>
          <Box style={{ flexShrink: 0, marginBottom: '8px' }}>
            <Select
              onChange={selected => {
                setDaysToShow(parseInt(selected?.toString() ?? '0', 10));
              }}
              label={t('content.dateRange')}
              options={daysToShowOptions}
              value={daysToShow.toString()}
              aria-label={t('content.dateRange')}
            />
          </Box>
          <Box style={{ flex: '0 0 25%', minHeight: 0 }}>
            <DailyUsersChart data={dailyUniqueVisitors} />
          </Box>
          <Box style={{ flex: 1, minHeight: 0 }}>
            <Tabs
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
              }}
            >
              <TabList>
                <Tab id="top-features">{t('content.topFeatures')}</Tab>
                <Tab id="mcp-actions">{t('content.mcpActions')}</Tab>
              </TabList>
              <TabPanel
                id="top-features"
                style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
              >
                <TopFeaturesTable data={topFeatures} />
              </TabPanel>
              <TabPanel
                id="mcp-actions"
                style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
              >
                <McpActionsTable data={mcpActions} />
              </TabPanel>
            </Tabs>
          </Box>
        </Flex>
      )}
    </Container>
  );
};
