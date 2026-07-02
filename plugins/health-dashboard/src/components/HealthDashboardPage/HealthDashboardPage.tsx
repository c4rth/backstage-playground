import {
  Content,
  PageWithHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { Box, Cell, ColumnConfig, useTable, Table } from '@backstage/ui';
import { useEffect, useRef, useState } from 'react';
import { useGetHealthData } from '../../hooks';
import {
  ApplicationHealthData,
  HealthDataError,
  HealthDataResponse,
} from '../../types';
import { HealthProbeCell } from './HealthProbeCell';
import styles from './HealthDashboardPage.module.css';

const emptyState = () => (
  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
    No health data found.
  </div>
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
        <b>{item.healthData.application}</b>
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

export const HealthDashboardPage = () => {
  const getHealthData = useGetHealthData();
  const isFirstRender = useRef(true);
  const [healthDataErrors, setHealthDataErrors] = useState<HealthDataError[]>(
    [],
  );

  const { tableProps, reload } = useTable({
    mode: 'complete',
    getData: () => fetchData(getHealthData, setHealthDataErrors),
    paginationOptions: {
      type: 'none',
    },
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    reload();
  }, [reload]);

  return (
    <PageWithHeader
      themeId="dashboard"
      title="Health Dashboard"
      pageTitleOverride="Health Dashboard"
    >
      <Content className={styles.contentRoot}>
        <Box bg="neutral" className={styles.contentScrollArea}>
          <Box className={styles.tableContainer}>
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
            <Table
              columnConfig={columns}
              {...tableProps}
              pagination={{
                type: 'none',
              }}
              emptyState={emptyState()}
              className={styles.denseTable}
            />
          </Box>
        </Box>
      </Content>
    </PageWithHeader>
  );
};
