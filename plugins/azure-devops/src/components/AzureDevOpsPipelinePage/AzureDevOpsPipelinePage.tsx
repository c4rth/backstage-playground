import { useState, useMemo } from 'react';
import { Table, TableHeader, TableBody, Column, Row, Cell, Card, CardHeader, CardBody, Text, Button, Flex, CellText } from '@backstage/ui';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useBuildRuns } from '../../hooks';
import { getDurationFromDates } from '../../utils';
import { DateTime } from 'luxon';
import {
  Link,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { getAnnotationValuesFromEntity } from '@backstage-community/plugin-azure-devops-common';
import type { BuildRun } from '@backstage-community/plugin-azure-devops-common';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { azureDevOpsApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';
import { ResizableTableContainer } from 'react-aria-components';
import { BuildStateComponent } from './BuildStateComponent';
import { LogsDialog } from './LogsDialog';

const DEFAULT_BUILD_LIMIT = 20;

const PipelineRow = ({ item, onViewLogs }: { item: BuildRun; onViewLogs?: (buildId: number, title: string) => void }) => {

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
    <Row key={item.id} id={item.id} className='custom-bui-TableRow'>
      <CellText title={item.id?.toString() ?? '-'} />
      <Cell>
        <Link to={item.link ?? ''}>{item.title}</Link>
      </Cell>
      <CellText title={item.source ?? '-'} />
      <Cell><BuildStateComponent status={item.status} result={item.result} /></Cell>
      <CellText title={duration} />
      <CellText title={age} />
      <Cell>
        <Button
          variant='primary'
          onPress={() => onViewLogs?.(item.id!, item.title ?? '')}
          isDisabled={!item.id}
        >
          View Logs
        </Button>
      </Cell>
    </Row>
  );
};

export const AzureDevOpsPipelinePage = () => {
  const [logsDialogState, setLogsDialogState] = useState({
    isOpen: false,
    title: '',
    loading: false,
    logs: null as string[] | null,
  });

  const azureApi = useApi(azureDevOpsApiRef);
  const { entity } = useEntity();
  const { items, loading, error } = useBuildRuns(entity, DEFAULT_BUILD_LIMIT);

  const fetchLogs = async (buildId: number, buildTitle: string) => {
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
      setLogsDialogState(prev => ({ ...prev, logs: ['Error fetching logs'] }));
    } finally {
      setLogsDialogState(prev => ({ ...prev, loading: false }));
    }
  };


  const cardTitle = (
    <Flex style={{ paddingTop: '12px', paddingLeft: '4px' }}>
      <Text variant='title-small' weight='bold'>Azure DevOps Pipelines</Text>
    </Flex>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>{cardTitle}</CardHeader>
        <CardBody><Progress /></CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>{cardTitle}</CardHeader>
        <CardBody><ResponseErrorPanel error={error} /></CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>{cardTitle}</CardHeader>
        <CardBody>
          <ResizableTableContainer>
            <Table aria-label="Azure DevOps pipeline runs">
              <TableHeader>
                <Column isRowHeader width='2%'>ID</Column>
                <Column width='25%'>Build</Column>
                <Column width='20%'>Source</Column>
                <Column width='15%'>State</Column>
                <Column width='10%'>Duration</Column>
                <Column width='15%'>Age</Column>
                <Column width='13%'>Actions</Column>
              </TableHeader>
              <TableBody
                items={items}
                renderEmptyState={() => (
                  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
                    No Pipelines found.
                  </div>
                )}
              >
                {item => <PipelineRow item={item} onViewLogs={fetchLogs} />}
              </TableBody>
            </Table>
          </ResizableTableContainer>
        </CardBody>
      </Card>

      <LogsDialog
        {...logsDialogState}
        onOpenChange={(isOpen) => setLogsDialogState(prev => ({ ...prev, isOpen }))}
      />
    </>
  );
};