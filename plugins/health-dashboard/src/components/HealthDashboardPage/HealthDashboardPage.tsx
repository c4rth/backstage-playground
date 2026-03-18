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

const emptyState = () => (
  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
    No health data found.
  </div>
);

async function fetchData(
  getHealthData: () => Promise<HealthData | undefined>,
) {
  const data = await getHealthData();
  return data?.map(toTableRow) ?? [];
}

type TableRow = {
  id: number,
  healthData: ApplicationHealthData,
}

const toTableRow = (healthData: ApplicationHealthData, idx: number): TableRow => ({
  id: idx,
  healthData,
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
  {
    id: 'tst',
    label: 'TST',
    cell: item => <HealthProbeCell healthProbe={item.healthData.environments['tst']} />,
    width: '10%',
  },
  {
    id: 'gtu',
    label: 'GTU',
    cell: item => <HealthProbeCell healthProbe={item.healthData.environments['gtu']} />,
    width: '10%',
  },
  {
    id: 'uat',
    label: 'UAT',
    cell: item => <HealthProbeCell healthProbe={item.healthData.environments['uat']} />,
    width: '10%',
  },
  {
    id: 'ptp',
    label: 'PTP',
    cell: item => <HealthProbeCell healthProbe={item.healthData.environments['ptp']} />,
    width: '10%',
  },
  {
    id: 'prd',
    label: 'PRD',
    cell: item => <HealthProbeCell healthProbe={item.healthData.environments['prd']} />,
    width: '10%',
  },
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
      title="Health Dashboard - OSDF"
      pageTitleOverride="Health Dashboard"
    >
      <Content>
        <Box bg="neutral-1" style={{ display: 'flex', justifyContent: 'center' }}>
          <Box >
            {tableProps.error ? (
              <ResponseErrorPanel title="Failed to get Health data" error={tableProps.error} />
            ) : tableProps.loading ? (
              <Progress />
            ) : (
              <Table
                columnConfig={columns}
                {...tableProps}
                pagination={{
                  type: 'none',
                }}
                emptyState={emptyState()}
              />
            )}
          </Box>
        </Box>
      </Content>
    </PageWithHeader>
  );

};