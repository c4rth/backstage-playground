import { useState, useMemo, useCallback } from 'react';
import {
  Table,
  Cell,
  Card,
  CardHeader,
  CardBody,
  Text,
  Button,
  Flex,
  CellText,
  useTable,
  ColumnConfig,
} from '@backstage/ui';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useBuildRuns } from '../../hooks';
import { getDurationFromDates } from '../../utils';
import { DateTime } from 'luxon';
import { Link, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { getAnnotationValuesFromEntity } from '@backstage-community/plugin-azure-devops-common';
import type { BuildRun } from '@backstage-community/plugin-azure-devops-common';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { azureDevOpsApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';
import { BuildStateComponent } from './BuildStateComponent';
import { LogsDialog } from './LogsDialog';
import styles from './AzureDevOpsPipelinePage.module.css';

type TableRow = {
  id: number;
  item: BuildRun;
};

const toTableRow = (buildRun: BuildRun, idx: number): TableRow => ({
  id: idx,
  item: buildRun,
});

const cardTitle = (
  <Flex style={{ paddingTop: '12px', paddingLeft: '4px' }}>
    <Text variant="title-small" weight="bold">
      Azure DevOps Pipelines
    </Text>
  </Flex>
);

const emptyState = () => (
  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
    No Pipelines found.
  </div>
);

function getAge(queueTime?: string): string {
  if (!queueTime) {
    return '-';
  }
  const queueDate = DateTime.fromISO(queueTime);
  const now = DateTime.now();
  if (queueDate.hasSame(now, 'day')) {
    return queueDate.toRelative() ?? '-';
  }
  return `${queueDate.toFormat('LLL d')} - ${queueDate.toLocaleString(DateTime.TIME_24_SIMPLE)}`;
}

function getDuration(finishTime?: string, startTime?: string): string {
  if (!startTime || !finishTime) {
    return '-';
  }
  return getDurationFromDates(startTime, finishTime);
}

async function fetchData(
  getBuildRuns: (entity: Entity) => Promise<{ items: BuildRun[] }>,
  entity: Entity,
) {
  const data = await getBuildRuns(entity);
  return data?.items.map(toTableRow) ?? [];
}

export const AzureDevOpsPipelinePage = () => {
  const [logsDialogState, setLogsDialogState] = useState({
    isOpen: false,
    title: '',
    loading: false,
    logs: null as string[] | null,
  });

  const azureApi = useApi(azureDevOpsApiRef);
  const { entity } = useEntity();

  const getBuildRuns = useBuildRuns();

  const fetchLogs = useCallback(
    async (buildId: number, buildTitle: string) => {
      setLogsDialogState(prev => ({
        ...prev,
        loading: true,
        logs: null,
        title: buildTitle,
        isOpen: true,
      }));

      if (!buildId) {
        setLogsDialogState(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const { project, host, org } = getAnnotationValuesFromEntity(entity);
        const response = await azureApi.getBuildRunLog(
          project,
          stringifyEntityRef(entity),
          buildId,
          host,
          org,
        );
        setLogsDialogState(prev => ({ ...prev, logs: response.log }));
      } catch (err) {
        setLogsDialogState(prev => ({
          ...prev,
          logs: ['Error fetching logs'],
        }));
      } finally {
        setLogsDialogState(prev => ({ ...prev, loading: false }));
      }
    },
    [azureApi, entity],
  );

  const columns: ColumnConfig<TableRow>[] = useMemo(
    () => [
      {
        id: 'id',
        label: 'ID',
        isRowHeader: true,
        cell: row => <CellText title={row.item.id?.toString() ?? '-'} />,
        width: '3%',
      },
      {
        id: 'build',
        label: 'Build',
        cell: row => (
          <Cell>
            <Link to={row.item.link ?? ''}>{row.item.title}</Link>
          </Cell>
        ),
        width: '25%',
      },
      {
        id: 'source',
        label: 'Source',
        cell: row => <CellText title={row.item.source ?? '-'} />,
        width: '20%',
      },
      {
        id: 'state',
        label: 'State',
        cell: row => (
          <Cell>
            <BuildStateComponent
              status={row.item.status}
              result={row.item.result}
            />
          </Cell>
        ),
        width: '15%',
      },
      {
        id: 'duration',
        label: 'Duration',
        cell: row => (
          <CellText
            title={getDuration(row.item.finishTime, row.item.startTime)}
          />
        ),
        width: '10%',
      },
      {
        id: 'age',
        label: 'Age',
        cell: row => <CellText title={getAge(row.item.queueTime)} />,
        width: '15%',
      },
      {
        id: 'actions',
        label: 'Actions',
        cell: row => (
          <Cell>
            <Button
              style={{ backgroundColor: 'var(--bui-fg-info)' }}
              onPress={() => fetchLogs(row.item.id!, row.item.title ?? '')}
              isDisabled={!row.item.id}
            >
              View Logs
            </Button>
          </Cell>
        ),
        width: '12%',
      },
    ],
    [fetchLogs],
  );

  const getData = useCallback(
    () => fetchData(getBuildRuns, entity),
    [getBuildRuns, entity],
  );

  const { tableProps } = useTable({
    mode: 'complete',
    getData,
  });

  if (tableProps.error) {
    return (
      <ResponseErrorPanel
        title="Failed to call AzureDevOps"
        error={tableProps.error}
      />
    );
  }

  if (tableProps.loading) {
    return <Progress />;
  }

  return (
    <>
      <Card>
        <CardHeader>{cardTitle}</CardHeader>
        <CardBody>
          <Table
            columnConfig={columns}
            {...tableProps}
            pagination={{
              type: 'none',
            }}
            emptyState={emptyState()}
            className={styles.customTable}
          />
        </CardBody>
      </Card>

      <LogsDialog
        {...logsDialogState}
        onOpenChange={isOpen =>
          setLogsDialogState(prev => ({ ...prev, isOpen }))
        }
      />
    </>
  );
};
