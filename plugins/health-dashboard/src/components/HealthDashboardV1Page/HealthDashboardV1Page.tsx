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
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { healthDashboardTranslationRef } from '../../translation';
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

const Legend = () => {
  const { t } = useTranslationRef(healthDashboardTranslationRef);
  const items = [
    { status: '200', label: t('dashboardV1Page.legend.ok'), ...STATUS_COLORS[200] },
    { status: '202', label: t('dashboardV1Page.legend.accepted'), ...STATUS_COLORS[202] },
    { status: '404', label: t('dashboardV1Page.legend.notFound'), ...STATUS_COLORS[404] },
    { status: '503', label: t('dashboardV1Page.legend.unavailable'), ...STATUS_COLORS[503] },
    { status: t('dashboardV1Page.legend.other'), label: t('dashboardV1Page.legend.error'), ...OTHER_STATUS_COLOR },
  ];

  return (
    <div className={styles.legend} aria-label={t('dashboardV1Page.legend.label')}>
      <b>{t('dashboardV1Page.legend.title')}</b>
      {items.map(({ status, label, color }) => (
        <div key={status} className={styles.legendItem}>
          <span
            className={styles.legendBullet}
            style={{ backgroundColor: color }}
          />
          {t('dashboardV1Page.legend.item', { label, status })}
        </div>
      ))}
    </div>
  );
};

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

export const HealthDashboardV1Page = () => {
  const { t } = useTranslationRef(healthDashboardTranslationRef);
  useDocumentTitle(t('dashboardV1Page.title'));
  const refreshIntervals = [
    { label: t('dashboardV1Page.refresh.off'), id: '0' },
    { label: t('dashboardV1Page.refresh.fiveSeconds'), id: '5000' },
    { label: t('dashboardV1Page.refresh.tenSeconds'), id: '10000' },
    { label: t('dashboardV1Page.refresh.thirtySeconds'), id: '30000' },
    { label: t('dashboardV1Page.refresh.oneMinute'), id: '60000' },
    { label: t('dashboardV1Page.refresh.fiveMinutes'), id: '300000' },
  ];
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
        title: t('dashboardV1Page.details.title', {
          application: application.toUpperCase(),
          environment: environment.toUpperCase(),
        }),
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
    [t],
  );

  const columns = useMemo<ColumnConfig<TableRow>[]>(
    () => [
      {
        id: 'app',
        label: t('dashboardV1Page.applicationColumn'),
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
    [handleProbeSelect, t],
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
        title={t('dashboardV1Page.title')}
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
                  {t('dashboardV1Page.refresh.button')}
                </Button>
                <Select
                  onChange={selected => {
                    setRefreshInterval(parseInt(selected?.toString() ?? '0', 10));
                  }}
                  label=""
                  options={refreshIntervals}
                  value={refreshInterval.toString()}
                  aria-label={t('dashboardV1Page.refresh.intervalLabel')}
                />
              </Box>
              <Legend />
            </Box>
            <InformationPopup content={
              <InformationPopupContent
                text={t('dashboardV1Page.description')}
                comment={t('dashboardV1Page.statusDescription')}
              />
            } />
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
              title={t('dashboardV1Page.errors.source', { source: sourceError.source })}
              error={new Error(sourceError.message)}
            />
          </Box>
        ))}
        {tableProps.error && (
          <ResponseErrorPanel
            title={t('dashboardV1Page.errors.render')}
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
            emptyState={
              <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
                {t('dashboardV1Page.emptyState')}
              </div>
            }
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
