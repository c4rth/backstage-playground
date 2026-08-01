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
} from '@backstage/ui';
import { useEffect, useRef, useState } from 'react';
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
} from '@internal/plugin-api-platform-react';
import styles from './HealthDashboardPage.module.css';

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

const HealthDashboardPageContent = () => {
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

  const pageContent = (
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
      <Table
        columnConfig={columns}
        {...tableProps}
        pagination={{
          type: 'none',
        }}
        emptyState={emptyState()}
        className={styles.denseTable}
      />
    </Container>
  );

  return pageContent;
};

export const HealthDashboardPage = () => {
  return (
    <>
      <PluginHeader
        title="Health Dashboard k8s"
        customActions={<InformationPopup content={POPUP_CONTENT} />}
      />
      <FullPage>
        <HealthDashboardPageContent />
      </FullPage>
    </>
  );
};
