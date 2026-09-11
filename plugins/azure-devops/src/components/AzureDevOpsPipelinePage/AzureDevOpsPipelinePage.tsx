import { useMemo, useCallback, useEffect } from 'react';
import {
  Table,
  Cell,
  Card,
  CardHeader,
  CardBody,
  Text,
  Flex,
  CellText,
  useTable,
  ColumnConfig,
  Link,
} from '@backstage/ui';
import { useEntity } from '@backstage/plugin-catalog-react';
import { getDurationFromDates } from '../../utils';
import { DateTime } from 'luxon';
import { ResponseErrorPanel } from '@backstage/core-components';
import type { BuildRun } from '@backstage-community/plugin-azure-devops-common';
import { BuildStateComponent } from './BuildStateComponent';
import { Progress } from '@internal/plugin-components-react';
import { useBuildRuns } from '../../hooks';

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

export const AzureDevOpsPipelinePage = () => {
  const { entity } = useEntity();
  const {
    items: buildRuns,
    loading: buildRunsLoading,
    error: buildRunsError,
  } = useBuildRuns(entity);

  const columns: ColumnConfig<TableRow>[] = useMemo(
    () => [
      {
        id: 'id',
        label: 'ID',
        isRowHeader: true,
        cell: row => <CellText title={row.item.id?.toString() ?? '-'} />,
        width: '5%',
      },
      {
        id: 'build',
        label: 'Build',
        cell: row => (
          <Cell>
            <Link
              href={row.item.link ?? ''}
              weight="bold"
              color="info"
              standalone
            >
              {row.item.title}
            </Link>
          </Cell>
        ),
        width: '25%',
      },
      {
        id: 'source',
        label: 'Source',
        cell: row => <CellText title={row.item.source ?? '-'} />,
        width: '30%',
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
    ],
    [],
  );

  const getData = useCallback(
    async () => (buildRuns ?? []).map(toTableRow),
    [buildRuns],
  );

  const { tableProps, reload } = useTable({
    mode: 'complete',
    getData,
  });

  useEffect(() => {
    reload();
  }, [buildRuns, reload]);

  const error = buildRunsError ?? tableProps.error;

  if (error) {
    return (
      <ResponseErrorPanel title="Failed to call AzureDevOps" error={error} />
    );
  }

  if (buildRunsLoading || tableProps.isPending) {
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
            className="denseTable"
          />
        </CardBody>
      </Card>
    </>
  );
};
