import { ResponseErrorPanel } from '@backstage/core-components';
import {
  Box,
  Cell,
  ColumnConfig,
  useTable,
  Table,
  FullPage,
  Container,
  Select,
  Button,
  Header,
} from '@backstage/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGetHealthV1Data } from '../../hooks';
import {
  ApplicationHealthV1Data,
  HealthDataError,
  HealthV1Probe,
  HealthV1DataResponse,
} from '../../types';
import { HealthProbeCell, OTHER_STATUS_COLOR, STATUS_COLORS } from './HealthProbeCell';
import {
  InformationPopup,
  InformationPopupContent,
  Progress,
  useDocumentTitle,
} from '@internal/plugin-components-react';
import styles from './HealthDashboardV1Page.module.css';
import { RiRestartLine } from '@remixicon/react';
import {
  HealthDetailsSelection,
  HealthDetailsSheet,
} from '../common/HealthDetailsSheet';

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

const LEGEND_ITEMS = [
  ...Object.entries(STATUS_COLORS).map(([status, { color, label }]) => ({
    status,
    color,
    label,
  })),
  {
    status: 'other',
    color: OTHER_STATUS_COLOR.color,
    label: OTHER_STATUS_COLOR.label,
  },
];

const Legend = () => (
  <div className={styles.legend} aria-label="Status color legend">
    <b>Health Status</b>
    {LEGEND_ITEMS.map(({ status, label, color }) => (
      <div key={label} className={styles.legendItem}>
        <span
          className={styles.legendBullet}
          style={{ backgroundColor: color }}
        />
        {label} ({status})
      </div>
    ))}
  </div>
);

type TableRow = {
  id: number;
  healthData: ApplicationHealthV1Data;
};

const toTableRow = (
  healthData: ApplicationHealthV1Data,
  idx: number,
): TableRow => ({
  id: idx,
  healthData,
});

async function fetchData(
  getHealthData: () => Promise<HealthV1DataResponse | undefined>,
  setErrors: (errors: HealthDataError[]) => void,
) {
  const response = await getHealthData();
  setErrors(response?.errors ?? []);
  return response?.healthData.map(toTableRow) ?? [];
}

const REFRESH_INTERVALS = [
  { label: 'Off', id: '0' },
  { label: '5s', id: '5000' },
  { label: '10s', id: '10000' },
  { label: '30s', id: '30000' },
  { label: '1m', id: '60000' },
  { label: '5m', id: '300000' },
];

export const HealthDashboardV1Page = () => {
  useDocumentTitle('Health Dashboard v1');
  const getHealthData = useGetHealthV1Data();
  const [healthDataErrors, setHealthDataErrors] = useState<HealthDataError[]>(
    [],
  );
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);
  const [selectedProbe, setSelectedProbe] =
    useState<HealthDetailsSelection | null>(null);

  const handleProbeSelect = useCallback(
    (application: string, environment: string, probe: HealthV1Probe) => {
      setSelectedProbe({
        title: `${application.toUpperCase()} - ${environment.toUpperCase()}`,
        sections: [
          {
            id: 'probe',
            fields: [
              ...Object.entries(probe)
                .filter(([key]) => key !== 'status')
                .map(([label, value]) => ({ label, value })),
              ...Object.entries(probe.status).map(([key, value]) => ({
                label: `status.${key}`,
                value,
              })),
            ],
          },
        ],
      });
    },
    [],
  );

  const columns = useMemo<ColumnConfig<TableRow>[]>(
    () => [
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
        minWidth: 160,
      },
      ...['tst', 'gtu', 'uat', 'ptp', 'prd'].map(env => ({
        id: env,
        label: env.toUpperCase(),
        cell: (item: TableRow) => (
          <HealthProbeCell
            healthProbe={item.healthData.environments[env]}
            application={item.healthData.application}
            environment={env}
            onSelect={probe =>
              handleProbeSelect(item.healthData.application, env, probe)
            }
          />
        ),
        width: '15%' as const,
        minWidth: 64,
      })),
    ],
    [handleProbeSelect],
  );

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
      reload();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, reload]);

  return (
    <FullPage>
      <Header
        title="Health Dashboard v1"
        sticky
        customActions={
          <>
            <Box
              className={styles.refreshControls}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 'var(--bui-space-2)',
              }}
            >
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
              <Legend />
            </Box>
            <InformationPopup content={POPUP_CONTENT} />
          </>
        }
      />
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
      <HealthDetailsSheet
        selection={selectedProbe}
        onClose={() => setSelectedProbe(null)}
      />
    </FullPage>
  );
};
