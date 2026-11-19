import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  Badge,
  Cell,
  ColumnConfig,
  Button,
  Table,
  useTable,
  Column,
  Row,
  Text,
  Box,
  VisuallyHidden,
} from '@backstage/ui';
import { RiArrowDownSLine, RiArrowRightSLine } from '@remixicon/react';
import { useMemo } from 'react';
import {
  healthDashboardTranslationRef,
  HealthDashboardTranslator,
} from '../../translation';
import { HealthV2Data } from '../../types';
import { HealthDashboardEmptyState } from '../common';
import styles from '../common/HealthDashboard.module.css';
import { HealthStatusIndicator } from '../common/HealthStatusIndicator';
import groupStyles from './HealthDashboardV2Page.module.css';
import {
  aggregateTechnicalStatus,
  buildHealthMatrix,
  getApplicationEnvironmentStatus,
  getEnvironmentNames,
  groupHealthMatrix,
  HealthV2ApplicationGroup,
  HealthV2MatrixRow,
} from './healthMatrix';

type TableRow =
  | (HealthV2ApplicationGroup & { id: string; kind: 'application' })
  | (HealthV2MatrixRow & { kind: 'component' });

const centerStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
} as const;

function getEnvironmentColumn(
  environment: string,
  onSelect: (row: HealthV2MatrixRow, environment: string) => void,
  t: HealthDashboardTranslator,
  width: `${number}%`,
): ColumnConfig<TableRow> {
  return {
    id: environment,
    label: environment,
    cell: item => {
      if (item.kind === 'application') {
        const status = getApplicationEnvironmentStatus(item, environment);
        return (
          <Cell className={groupStyles.groupCell}>
            {status && (
              <Box style={centerStyle}>
                <Badge
                  size="small"
                  className={groupStyles.summaryBadge}
                  data-status={status}
                  role="img"
                  aria-label={t(`dashboardV2Page.summary.status.${status}`)}
                />
              </Box>
            )}
          </Cell>
        );
      }
      const probes = item.environments[environment];
      if (!probes?.length) {
        return (
          <Cell className={groupStyles.environmentCell}>
            <Box style={centerStyle} className={groupStyles.noStatus}>
              -
            </Box>
          </Cell>
        );
      }
      const status = aggregateTechnicalStatus(probes);
      return (
        <Cell className={groupStyles.environmentCell}>
          <Box style={centerStyle}>
            <Button
              className={styles.statusButton}
              aria-label={t('dashboardV2Page.details.showHealth', {
                environment,
                application: item.application,
                component: item.component ?? '-',
              })}
              onPress={() => onSelect(item, environment)}
            >
              <HealthStatusIndicator status={status} />
            </Button>
          </Box>
        </Cell>
      );
    },
    header: () => (
      <Column id={environment} className="centered-col-header">
        <Text weight="bold">{environment}</Text>
      </Column>
    ),
    width,
    minWidth: 64,
  };
}

type HealthMatrixTableProps = {
  healthData: HealthV2Data;
  selectedApplications: readonly string[];
  expandedApplications: ReadonlySet<string>;
  onToggleApplication: (application: string) => void;
  onSelectEnvironment: (row: HealthV2MatrixRow, environment: string) => void;
};

export const HealthMatrixTable = ({
  healthData,
  selectedApplications,
  expandedApplications,
  onToggleApplication,
  onSelectEnvironment,
}: HealthMatrixTableProps) => {
  const { t } = useTranslationRef(healthDashboardTranslationRef);

  const environmentNames = useMemo(
    () => getEnvironmentNames(healthData),
    [healthData],
  );

  const columns = useMemo<ColumnConfig<TableRow>[]>(() => {
    const environmentColumnWidth: `${number}%` = `${
      44 / environmentNames.length
    }%`;
    return [
      {
        id: 'application',
        label: t('dashboardV2Page.columns.application'),
        isRowHeader: true,
        cell: item => (
          <Cell
            className={
              item.kind === 'application' ? groupStyles.groupCell : undefined
            }
          >
            {item.kind === 'application' ? (
              <button
                type="button"
                className={groupStyles.groupToggle}
                aria-expanded={expandedApplications.has(item.application)}
                aria-label={t('dashboardV2Page.summary.toggle', {
                  application: item.application,
                })}
                onClick={event => {
                  event.stopPropagation();
                  onToggleApplication(item.application);
                }}
              >
                {!expandedApplications.has(item.application) ? (
                  <RiArrowRightSLine aria-hidden="true" />
                ) : (
                  <RiArrowDownSLine aria-hidden="true" />
                )}
                <span>
                  {item.application} ({item.components.length})
                </span>
              </button>
            ) : (
              <VisuallyHidden>{item.application}</VisuallyHidden>
            )}
          </Cell>
        ),
        width: '15%',
        minWidth: 80,
      },
      {
        id: 'component',
        label: t('dashboardV2Page.columns.component'),
        isRowHeader: true,
        cell: item => (
          <Cell
            className={
              item.kind === 'application' ? groupStyles.groupCell : undefined
            }
          >
            {item.kind === 'component' && (
              <span title={item.component ?? '-'}>{item.component ?? '-'}</span>
            )}
          </Cell>
        ),
        width: '40%',
        minWidth: 240,
      },
      ...environmentNames.map(environment =>
        getEnvironmentColumn(
          environment,
          onSelectEnvironment,
          t,
          environmentColumnWidth,
        ),
      ),
    ];
  }, [
    expandedApplications,
    environmentNames,
    onSelectEnvironment,
    t,
    onToggleApplication,
  ]);

  const tableRows = useMemo<TableRow[]>(
    () =>
      groupHealthMatrix(
        buildHealthMatrix(healthData, selectedApplications),
      ).flatMap(group => [
        {
          ...group,
          id: JSON.stringify(['application', group.application]),
          kind: 'application' as const,
        },
        ...(expandedApplications.has(group.application)
          ? group.components.map(component => ({
              ...component,
              id: JSON.stringify([
                'component',
                component.application,
                component.component,
              ]),
              kind: 'component' as const,
            }))
          : []),
      ]),
    [healthData, selectedApplications, expandedApplications],
  );

  const { tableProps } = useTable({
    mode: 'complete',
    data: tableRows,
    paginationOptions: {
      type: 'none',
    },
  });

  return (
    <Table
      columnConfig={columns}
      {...tableProps}
      rowConfig={({ item }) => (
        <Row
          id={item.id}
          columns={columns}
          className={
            item.kind === 'application'
              ? groupStyles.groupRow
              : groupStyles.componentRow
          }
          onAction={
            item.kind === 'application'
              ? () => onToggleApplication(item.application)
              : undefined
          }
        >
          {column => column.cell(item)}
        </Row>
      )}
      emptyState={<HealthDashboardEmptyState />}
      className={`denseTable ${styles.healthTable} ${groupStyles.groupedTable}`}
    />
  );
};
