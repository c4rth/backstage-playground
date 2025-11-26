import { useState, useMemo, useCallback, memo } from 'react';
import { Table, TableHeader, TableBody, Column, Row, Cell, Card, CardHeader, CardBody, Text, Button, Flex, DialogTrigger, Dialog, DialogHeader, DialogBody, Box } from '@backstage/ui';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useBuildRuns } from '../../hooks';
import { getDurationFromDates } from '../../utils';
import { DateTime } from 'luxon';
import { Cell as RACell } from 'react-aria-components';
import {
  Link,
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
  StatusWarning,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { BuildResult, BuildStatus, getAnnotationValuesFromEntity } from '@backstage-community/plugin-azure-devops-common';
import type { BuildRun } from '@backstage-community/plugin-azure-devops-common';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { azureDevOpsApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_BUILD_LIMIT = 20;

const BUILD_RESULT_CONFIG = {
  [BuildResult.Succeeded]: { icon: StatusOK, label: 'Succeeded' },
  [BuildResult.PartiallySucceeded]: { icon: StatusWarning, label: 'Partially Succeeded' },
  [BuildResult.Failed]: { icon: StatusError, label: 'Failed' },
  [BuildResult.Canceled]: { icon: StatusAborted, label: 'Canceled' },
  [BuildResult.None]: { icon: StatusWarning, label: 'Unknown' },
} as const;

const BUILD_STATUS_CONFIG = {
  [BuildStatus.InProgress]: { icon: StatusRunning, label: 'In Progress' },
  [BuildStatus.Cancelling]: { icon: StatusAborted, label: 'Cancelling' },
  [BuildStatus.Postponed]: { icon: StatusPending, label: 'Postponed' },
  [BuildStatus.NotStarted]: { icon: StatusAborted, label: 'Not Started' },
  [BuildStatus.None]: { icon: StatusWarning, label: 'Unknown' },
} as const;

interface StatusDisplayProps {
  icon: React.ComponentType;
  label: string;
}

const StatusDisplay = memo(({ icon: Icon, label }: StatusDisplayProps) => (
  <Flex gap='0' align='baseline'>
    <Icon />
    {label}
  </Flex>
));

export const getBuildResultComponent = (result: number | undefined) => {
  const config = result !== undefined
    ? BUILD_RESULT_CONFIG[result as BuildResult]
    : BUILD_RESULT_CONFIG[BuildResult.None];

  return <StatusDisplay icon={config.icon} label={config.label} />;
};

export const getBuildStateComponent = (
  status: number | undefined,
  result: number | undefined,
) => {
  if (status === BuildStatus.Completed) {
    return getBuildResultComponent(result);
  }
  const statusKey = status !== undefined ? status : BuildStatus.None;
  const config = BUILD_STATUS_CONFIG[statusKey as keyof typeof BUILD_STATUS_CONFIG]
    ?? BUILD_STATUS_CONFIG[BuildStatus.None];

  return <StatusDisplay icon={config.icon} label={config.label} />;
};

interface PipelineRowProps {
  item: BuildRun;
  onViewLogs?: (buildId: number) => void;
  loadingLogs: boolean;
  logs: string[] | null;
}

const PipelineRow = memo(({ item, onViewLogs, loadingLogs, logs }: PipelineRowProps) => {

  const handleViewLogs = useCallback(() => {
    if (onViewLogs && item.id) {
      onViewLogs(item.id);
    }
  }, [onViewLogs, item.id]);

  const age = useMemo(() => {
    if (!item.queueTime) {
      return DateTime.now().toRelative() ?? '-';
    }
    
    const queueDate = DateTime.fromISO(item.queueTime);
    const now = DateTime.now();
    
    if (queueDate.hasSame(now, 'day')) {
      return queueDate.toRelative() ?? '-';
    }
    
    return `${queueDate.toFormat('LLL d')} - ${queueDate.toLocaleString(DateTime.TIME_24_SIMPLE)}`;
  }, [item.queueTime]);

  const duration = useMemo(() => {
    return getDurationFromDates(item.startTime, item.finishTime);
  }, [item.startTime, item.finishTime]);

  return (
    <Row key={item.id} id={item.id}>
      <Cell title={item.id?.toString() ?? '-'} />
      <RACell>
        <Link to={item.link ?? ''}>{item.title}</Link>
      </RACell>
      <Cell title={item.source} />
      <RACell>{getBuildStateComponent(item.status, item.result)}</RACell>
      <Cell title={duration} />
      <Cell title={age} />
      <RACell>
        <DialogTrigger>
          <Button variant='primary' onClick={handleViewLogs} isDisabled={!item.id}>
            View Logs
          </Button>
          {!loadingLogs && logs && (
            <Dialog width='100%' height='100%'>
              <DialogHeader>
                <Flex style={{ width: '100%' }}>
                  Logs - {item.title}
                </Flex>
              </DialogHeader>
              <DialogBody>
                <Box as='pre' style={{ whiteSpace: 'pre-wrap' }}>
                  <Text style={{ fontFamily: 'monospace' }}>
                    {logs?.join('\n')}
                  </Text>
                </Box>
              </DialogBody>
            </Dialog>
          )}
        </DialogTrigger>
      </RACell>
    </Row>
  );
});

const emptyState = () => (
  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
    No tags found.
  </div>
);

export const AzureDevOpsPipelinePage = () => {
  const [logs, setLogs] = useState<string[] | null>(null);
  const azureApi = useApi(azureDevOpsApiRef);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const { entity } = useEntity();
  const { items, loading, error } = useBuildRuns(entity, DEFAULT_BUILD_LIMIT);

  const fetchLogs = useCallback(async (buildId: number) => {
    setLoadingLogs(true);
    setLogs([]);
    if (!buildId) {
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

      setLogs(response.log);
    } catch (err) {
      //
    } finally {
      setLoadingLogs(false);
    }
  }, [entity, azureApi]);

  const handleViewLogs = useCallback((buildId: number) => {
    fetchLogs(buildId);
  }, [fetchLogs]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Text variant='title-small' weight='bold'>Azure DevOps Pipelines</Text>
        </CardHeader>
        <CardBody>
          <Progress />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <Text variant='title-small' weight='bold'>Azure DevOps Pipelines</Text>
        </CardHeader>
        <CardBody>
          <ResponseErrorPanel error={error} />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      {loadingLogs && (
        <Progress />
      )}
      <Card>
        <CardHeader>
          <Text variant='title-small' weight='bold'>
            Azure DevOps Pipelines
          </Text>
        </CardHeader>
        <CardBody>
          <Table aria-label="Azure DevOps pipeline runs">
            <TableHeader>
              <Column isRowHeader>ID</Column>
              <Column>Build</Column>
              <Column>Source</Column>
              <Column>State</Column>
              <Column>Duration</Column>
              <Column>Age</Column>
              <Column>Actions</Column>
            </TableHeader>
            <TableBody items={items} renderEmptyState={emptyState}>
              {item => (
                <PipelineRow
                  item={item}
                  onViewLogs={handleViewLogs}
                  loadingLogs={loadingLogs}
                  logs={logs}
                />
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

    </>
  );
};