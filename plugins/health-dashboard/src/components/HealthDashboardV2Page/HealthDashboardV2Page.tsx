import { ResponseErrorPanel } from '@backstage/core-components';
import {
  Cell,
  ColumnConfig,
  Flex,
  Button,
  Select,
  Table,
  useTable,
  Column,
  Row,
  Text,
  Box,
  VisuallyHidden,
} from '@backstage/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HealthDataError, HealthV2Data } from '../../types';
import { useGetHealthV2Data } from '../../hooks';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  healthDashboardTranslationRef,
  HealthDashboardTranslator,
} from '../../translation';

import { Progress, useDocumentTitle } from '@internal/plugin-components-react';
import {
  aggregateTechnicalStatus,
  buildHealthMatrix,
  getApplicationEnvironmentStatus,
  getEnvironmentNames,
  groupHealthMatrix,
  HealthV2ApplicationGroup,
  HealthV2MatrixRow,
} from './healthMatrix';
import {
  RefreshControls,
  HealthDashboardEmptyState,
  HealthDetailsSelection,
  HealthDashboardLayout,
} from '../common';
import styles from '../common/HealthDashboard.module.css';
import { HealthStatusIndicator } from '../common/HealthStatusIndicator';
import groupStyles from './HealthDashboardV2Page.module.css';
import { RiArrowDownSLine, RiArrowRightSLine } from '@remixicon/react';

const ALL_APPLICATIONS_ID = 'All';

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
                <HealthStatusIndicator status={status} />
              </Box>
            )}
          </Cell>
        );
      }
      const probes = item.environments[environment];
      if (!probes?.length) {
        return (
          <Cell>
            <Box style={centerStyle}>-</Box>
          </Cell>
        );
      }
      const status = aggregateTechnicalStatus(probes);
      return (
        <Cell>
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

export const HealthDashboardV2Page = () => {
  const { t } = useTranslationRef(healthDashboardTranslationRef);
  useDocumentTitle(t('dashboardV2Page.title'));

  const getHealthData = useGetHealthV2Data();
  const [healthData, setHealthData] = useState<HealthV2Data>({});
  const [reloadCount, setReloadCount] = useState(0);
  const reload = useCallback(() => setReloadCount(count => count + 1), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedApplications = useMemo(
    () =>
      (searchParams.get('application') ?? '')
        .split(',')
        .filter(
          application => application && application !== ALL_APPLICATIONS_ID,
        ),
    [searchParams],
  );
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(
    () => new Set(selectedApplications),
  );
  useEffect(() => {
    setExpandedApplications(current => {
      const newlySelectedApplications = selectedApplications.filter(
        application => !current.has(application),
      );
      if (!newlySelectedApplications.length) {
        return current;
      }
      return new Set([...current, ...newlySelectedApplications]);
    });
  }, [selectedApplications]);
  const updateApplications = (applications: string[]) => {
    setSearchParams(currentParams => {
      const nextParams = new URLSearchParams(currentParams);
      if (applications.length) {
        nextParams.set('application', applications.join(','));
      } else {
        nextParams.delete('application');
      }
      return nextParams;
    });
    const previouslySelectedApplications = new Set(selectedApplications);
    const newlySelectedApplications = applications.filter(
      application => !previouslySelectedApplications.has(application),
    );
    if (newlySelectedApplications.length) {
      setExpandedApplications(current => {
        const next = new Set(current);
        newlySelectedApplications.forEach(application => next.add(application));
        return next;
      });
    }
  };
  const [healthDataErrors, setHealthDataErrors] = useState<HealthDataError[]>(
    [],
  );
  const [loadError, setLoadError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<HealthDetailsSelection | null>(null);
  const toggleApplication = useCallback((application: string) => {
    setExpandedApplications(current => {
      const next = new Set(current);
      if (!next.has(application)) {
        next.add(application);
      } else {
        next.delete(application);
      }
      return next;
    });
  }, []);

  const handleEnvironmentSelect = useCallback(
    (row: HealthV2MatrixRow, environment: string) => {
      const probes = row.environments[environment];
      if (probes?.length) {
        setSelectedEnvironment({
          title: t('dashboardV2Page.details.title', {
            application: row.application,
            component: row.component ?? '?',
            environment,
          }),
          sections: probes.map((probe, index) => ({
            id: `${probe.healthProbeUrl}-${index}`,
            fields: Object.entries(probe).map(([label, value]) => ({
              label,
              value,
            })),
          })),
        });
      }
    },
    [t],
  );

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setLoadError(undefined);
    getHealthData()
      .then(response => {
        if (isMounted) {
          setHealthData(response.healthData);
          setHealthDataErrors(response.errors);
        }
      })
      .catch(error => {
        if (isMounted) {
          setLoadError(
            error instanceof Error
              ? error
              : new Error(t('dashboardV2Page.errors.unknown')),
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [getHealthData, reloadCount, t]);

  const applicationOptions = useMemo(() => {
    const applications = new Set<string>();

    Object.values(healthData).forEach(groups => {
      Object.values(groups).forEach(group => {
        Object.values(group).forEach(probe => {
          applications.add(probe.application);
        });
      });
    });

    return [
      {
        label: t('dashboardV2Page.filters.allApplications'),
        id: ALL_APPLICATIONS_ID,
      },
      ...Array.from(applications)
        .sort((left, right) => left.localeCompare(right))
        .map(application => ({ label: application, id: application })),
    ];
  }, [healthData, t]);

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
                  toggleApplication(item.application);
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
          handleEnvironmentSelect,
          t,
          environmentColumnWidth,
        ),
      ),
    ];
  }, [
    expandedApplications,
    environmentNames,
    handleEnvironmentSelect,
    t,
    toggleApplication,
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

  const emptyState = useMemo(() => <HealthDashboardEmptyState />, []);

  const table = useMemo(
    () => (
      <Table
        columnConfig={columns}
        {...tableProps}
        rowConfig={({ item }) => (
          <Row
            id={item.id}
            columns={columns}
            className={
              item.kind === 'application' ? groupStyles.groupRow : undefined
            }
            onAction={
              item.kind === 'application'
                ? () => toggleApplication(item.application)
                : undefined
            }
          >
            {column => column.cell(item)}
          </Row>
        )}
        emptyState={emptyState}
        className={`denseTable ${styles.healthTable}`}
      />
    ),
    [columns, tableProps, emptyState, toggleApplication],
  );

  return (
    <HealthDashboardLayout
      title={t('dashboardV2Page.title')}
      description={t('dashboardV2Page.description')}
      statusDescription={t('dashboardV2Page.statusDescription')}
      sourceErrors={healthDataErrors}
      selection={selectedEnvironment}
      onCloseDetails={() => setSelectedEnvironment(null)}
      actions={
        <Flex style={{ alignItems: 'center' }}>
          <Text>{t('dashboardV2Page.filters.applications')}</Text>
          <Select
            label=""
            search
            selectionMode="multiple"
            options={applicationOptions}
            value={
              selectedApplications.length
                ? selectedApplications
                : [ALL_APPLICATIONS_ID]
            }
            onChange={selected => {
              updateApplications(
                selected.includes(ALL_APPLICATIONS_ID) &&
                  selectedApplications.length > 0
                  ? []
                  : selected
                      .map(String)
                      .filter(
                        application => application !== ALL_APPLICATIONS_ID,
                      ),
              );
            }}
            aria-label={t('dashboardV2Page.filters.applicationLabel')}
            style={{ minWidth: '150px' }}
          />
          <RefreshControls onRefresh={reload} isDisabled={isLoading} />
        </Flex>
      }
    >
      {loadError && (
        <ResponseErrorPanel
          title={t('dashboardV2Page.errors.load')}
          error={loadError}
        />
      )}
      {isLoading ? <Progress /> : table}
    </HealthDashboardLayout>
  );
};
