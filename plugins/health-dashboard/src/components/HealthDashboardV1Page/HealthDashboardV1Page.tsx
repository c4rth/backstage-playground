import { ResponseErrorPanel } from '@backstage/core-components';
import { Box, Cell, ColumnConfig, useTable, Table } from '@backstage/ui';
import { useCallback, useMemo, useState } from 'react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { healthDashboardTranslationRef } from '../../translation';
import { useGetHealthV1Data } from '../../hooks';
import {
  ApplicationHealthV1Data,
  HealthDataError,
  HealthV1Probe,
  HealthV1DataResponse,
} from '../../types';
import { HealthProbeCell } from './HealthProbeCell';
import { HealthDashboardLegend } from './HealthDashboardLegend';
import { Progress, useDocumentTitle } from '@internal/plugin-components-react';
import {
  RefreshControls,
  HealthDashboardEmptyState,
  HealthDashboardLayout,
  HealthDetailsSelection,
} from '../common';
import styles from './HealthDashboardV1Page.module.css';
import commonStyles from '../common/HealthDashboard.module.css';

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
  const getHealthData = useGetHealthV1Data();
  const [healthDataErrors, setHealthDataErrors] = useState<HealthDataError[]>(
    [],
  );
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

  return (
    <HealthDashboardLayout
      title={t('dashboardV1Page.title')}
      description={t('dashboardV1Page.description')}
      statusDescription={t('dashboardV1Page.statusDescription')}
      sourceErrors={healthDataErrors}
      spaceSourceErrors
      selection={selectedProbe}
      onCloseDetails={() => setSelectedProbe(null)}
      actions={
        <Box
          className={styles.refreshControls}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 'var(--bui-space-2)',
          }}
        >
          <RefreshControls
            onRefresh={reload}
            isDisabled={tableProps.isPending}
          />
          <HealthDashboardLegend />
        </Box>
      }
    >
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
          emptyState={<HealthDashboardEmptyState />}
          className={`denseTable ${commonStyles.healthTable} ${styles.healthTable}`}
        />
      )}
    </HealthDashboardLayout>
  );
};
