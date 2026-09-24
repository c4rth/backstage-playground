import { ResponseErrorPanel } from '@backstage/core-components';
import {
  Box,
  Cell,
  ColumnConfig,
  useTable,
  Table,
  FullPage,
  PluginHeader,
  Container,
  Select,
  Button,
} from '@backstage/ui';
import { useCallback, useEffect, useState } from 'react';
import { useGetHealthData } from '../../hooks';
import {
  ApplicationHealthData,
  HealthDataError,
  HealthDataResponse,
} from '../../types';
import { HealthProbeCell } from './HealthProbeCell';
import {
  InformationPopup,
  InformationPopupContent,
  Progress,
} from '@internal/plugin-components-react';
import styles from './HealthDashboardPage.module.css';
import { RiRestartLine } from '@remixicon/react';

const emptyState = () => (
  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
    No health data found.
  </div>
);

const POPUP_CONTENT = (
  <InformationPopupContent
    text1="View the health dashboard for applications deployed in k8s. This screen displays each application and the health status reported for each environment."
    text2="The health status reflects the response returned by the applications, helping you quickly identify which services are healthy and which require attention."
  />
);

type TableRow = {
  id: number;
  healthData: ApplicationHealthData;
};

const toTableRow = (
  healthData: ApplicationHealthData,
  idx: number,
): TableRow => ({
  id: idx,
  healthData,
});

async function fetchData(
  getHealthData: () => Promise<HealthDataResponse | undefined>,
  setErrors: (errors: HealthDataError[]) => void,
) {
  const response = await getHealthData();
  setErrors(response?.errors ?? []);
  return response?.healthData.map(toTableRow) ?? [];
}

const getEnvironmentColumn = (env: string): ColumnConfig<TableRow> => ({
  id: env,
  label: env.toUpperCase(),
  cell: item => (
    <HealthProbeCell healthProbe={item.healthData.environments[env]} />
  ),
  width: '15%',
});

const columns: ColumnConfig<TableRow>[] = [
  {
    id: 'app',
    label: 'APPLICATION',
    isRowHeader: true,
    cell: item => (
      <Cell>
        <b>{item.healthData.application.toUpperCase()}</b>
      </Cell>
    ),
    isSortable: true,
    width: '25%',
  },
  getEnvironmentColumn('tst'),
  getEnvironmentColumn('gtu'),
  getEnvironmentColumn('uat'),
  getEnvironmentColumn('ptp'),
  getEnvironmentColumn('prd'),
];

const REFRESH_INTERVALS = [
  { label: 'Off', id: '0' },
  { label: '5s', id: '5000' },
  { label: '10s', id: '10000' },
  { label: '30s', id: '30000' },
  { label: '1m', id: '60000' },
  { label: '5m', id: '300000' },
];

export const HealthDashboardPage = () => {
  const getHealthData = useGetHealthData();
  const [healthDataErrors, setHealthDataErrors] = useState<HealthDataError[]>(
    [],
  );
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);

  // Wrap getData in useCallback so useTable gets a stable reference
  const loadData = useCallback(() => {
    return fetchData(getHealthData, setHealthDataErrors);
  }, [getHealthData]);

  const { tableProps, reload } = useTable({
    mode: 'complete',
    getData: loadData,
    paginationOptions: {
      type: 'none',
    },
  });

  // Handle auto-refresh interval
  useEffect(() => {
    // If 'Off' (0ms) is selected, do not set an interval
    if (refreshInterval <= 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      console.log(`Auto-refreshing health data every ${refreshInterval}ms`);
      reload();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, reload]);

  return (
    <>
      <PluginHeader
        title="Health Dashboard k8s"
        customActions={
          <>
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="secondary"
                onClick={() => reload()}
                iconEnd={<RiRestartLine />}
                isDisabled={tableProps.isPending}
              >
                Refresh
              </Button>
              <Select
                onChange={selected => {
                  setRefreshInterval(parseInt(selected?.toString() ?? '0', 10));
                }}
                label=""
                options={REFRESH_INTERVALS}
                value={refreshInterval.toString()}
                aria-label="Auto-refresh interval"
              />
            </Box>
            <InformationPopup content={POPUP_CONTENT} />
          </>
        }
      />
      <FullPage>
        <Container
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {healthDataErrors.map((sourceError, index) => (
            <Box mb="4" key={`${sourceError.source}-${index}`}>
              <ResponseErrorPanel
                title={`Failed to get ${sourceError.source} health data`}
                error={new Error(sourceError.message)}
              />
            </Box>
          ))}
          {tableProps.error && (
            <ResponseErrorPanel
              title="Failed to render Health data"
              error={tableProps.error}
            />
          )}
          {tableProps.isPending && <Progress />}
          {!tableProps.isPending && (
            <Table
              columnConfig={columns}
              {...tableProps}
              pagination={{
                type: 'none',
              }}
              emptyState={emptyState()}
              className={`denseTable ${styles.healthTable}`}
            />
          )}
        </Container>
      </FullPage>
    </>
  );
};
