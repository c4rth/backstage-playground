import {
  Content,
  PageWithHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { Box, CellText, ColumnConfig, useTable, Table } from '@backstage/ui';
import { useEffect, useRef } from 'react';
import { useGetHealthData } from '../../hooks';
import { ApplicationHealthData, HealthData } from '../../types';
import { HealthProbeCell } from './HealthProbeCell';
import styles from './HealthDashboardPage.module.css';

const emptyState = () => (
  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
    No health data found.
  </div>
);

type TableRow = {
  id: number,
  healthData: ApplicationHealthData,
}

const toTableRow = (healthData: ApplicationHealthData, idx: number): TableRow => ({
  id: idx,
  healthData,
});

async function fetchData(
  getHealthData: () => Promise<HealthData | undefined>,
) {
  const data = await getHealthData();
  return data?.map(toTableRow) ?? [];
}

const getEnvironmentColumn = (env: string): ColumnConfig<TableRow> => ({
    id: env,
    label: env.toUpperCase(),
    cell: item => <HealthProbeCell healthProbe={item.healthData.environments[env]} />,
    width: '15%',
});

const columns: ColumnConfig<TableRow>[] = [
  {
    id: 'app',
    label: 'Application',
    isRowHeader: true,
    cell: item => <CellText title={item.healthData.application} />,
    isSortable: true,
    width: '25%'
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

  const {
    tableProps,
    reload,
  } = useTable({
    mode: 'complete',
    getData: () => fetchData(getHealthData),
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
      <Content>
        <Box bg="neutral" style={{ display: 'flex', justifyContent: 'center' }}>
          <Box >
            {tableProps.error && (
              <ResponseErrorPanel title="Failed to get Health data" error={tableProps.error} />
            )}
            {!tableProps.error && tableProps.loading && (
              <Progress />
            )}
            {!tableProps.error && !tableProps.loading && (
              <Table
                columnConfig={columns}
                {...tableProps}
                pagination={{
                  type: 'none',
                }}
                emptyState={emptyState()}
                className={styles.denseTable}
              />
            )}
          </Box>
        </Box>
      </Content>
    </PageWithHeader>
  );

};