import { ResponseErrorPanel } from '@backstage/core-components';
import {
  Cell,
  ColumnConfig,
  Container,
  FullPage,
  Flex,
  Header,
  Button,
  Select,
  Table,
  useTable,
  CellText,
  Column,
  Text,
  Box,
} from '@backstage/ui';
import { Button as AriaButton } from 'react-aria-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RiRestartLine } from '@remixicon/react';
import { HealthDataError, HealthV2Data } from '../../types';
import { useGetHealthV2Data } from '../../hooks';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  healthDashboardTranslationRef,
  HealthDashboardTranslator,
} from '../../translation';

import {
  InformationPopup,
  InformationPopupContent,
  Progress,
  useDocumentTitle,
} from '@internal/plugin-components-react';
import styles from './HealthDashboardV2Page.module.css';
import {
  aggregateTechnicalStatus,
  buildHealthMatrix,
  getEnvironmentNames,
  HealthV2MatrixRow,
} from './healthMatrix';
import {
  HealthDetailsSelection,
  HealthDetailsSheet,
} from '../common/HealthDetailsSheet';

const ALL_APPLICATIONS_ID = 'All';

type HealthV2TableRow = HealthV2MatrixRow;

const centerStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
} as const;

const getTechnicalStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'GREEN':
      return '#4caf50';
    case 'RED':
      return '#f44336';
    default:
      return '#9e9e9e';
  }
};

const statusBulletStyle = (color: string) =>
  ({
    borderRadius: '50%',
    width: '1em',
    height: '1em',
    backgroundColor: color,
  }) as const;

function getEnvironmentColumn(
  environment: string,
  onSelect: (row: HealthV2TableRow, environment: string) => void,
  t: HealthDashboardTranslator,
): ColumnConfig<HealthV2TableRow> {
  return {
    id: environment,
    label: environment,
    cell: item => {
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
            <AriaButton
              className={styles.statusButton}
              aria-label={t('dashboardV2Page.details.showHealth', {
                environment,
                application: item.application,
                component: item.component ?? '-',
              })}
              onPress={() => onSelect(item, environment)}
            >
              <span
                aria-hidden="true"
                style={statusBulletStyle(getTechnicalStatusColor(status))}
              />
            </AriaButton>
          </Box>
        </Cell>
      );
    },
    header: () => (
      <Column id={environment} className="centered-col-header">
        <Text weight="bold">{environment}</Text>
      </Column>
    ),
    width: '8%',
    minWidth: 64,
  };
}

export const HealthDashboardV2Page = () => {
  const { t } = useTranslationRef(healthDashboardTranslationRef);
  useDocumentTitle(t('dashboardV2Page.title'));

  const refreshIntervals = [
    { label: t('dashboardV2Page.refresh.off'), id: '0' },
    { label: t('dashboardV2Page.refresh.fiveSeconds'), id: '5000' },
    { label: t('dashboardV2Page.refresh.tenSeconds'), id: '10000' },
    { label: t('dashboardV2Page.refresh.thirtySeconds'), id: '30000' },
    { label: t('dashboardV2Page.refresh.oneMinute'), id: '60000' },
    { label: t('dashboardV2Page.refresh.fiveMinutes'), id: '300000' },
  ];
  const getHealthData = useGetHealthV2Data();
  const [healthData, setHealthData] = useState<HealthV2Data>({});
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);
  const [reloadCount, setReloadCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedApplications = useMemo(
    () =>
      (searchParams.get('application') ?? '')
        .split(',')
        .filter(application => application && application !== ALL_APPLICATIONS_ID),
    [searchParams],
  );
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
  };
  const [healthDataErrors, setHealthDataErrors] = useState<HealthDataError[]>(
    [],
  );
  const [loadError, setLoadError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<HealthDetailsSelection | null>(null);

  const handleEnvironmentSelect = useCallback(
    (row: HealthV2TableRow, environment: string) => {
      const probes = row.environments[environment];
      if (probes?.length) {
        setSelectedEnvironment({
          title: t('dashboardV2Page.details.title', {
            application: row.application,
            environment,
          }),
          subtitle: row.component ?? '-',
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
            error instanceof Error ? error : new Error(t('dashboardV2Page.errors.unknown')),
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

  useEffect(() => {
    if (refreshInterval <= 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setReloadCount(count => count + 1);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

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
      { label: t('dashboardV2Page.filters.allApplications'), id: ALL_APPLICATIONS_ID },
      ...Array.from(applications)
        .sort((left, right) => left.localeCompare(right))
        .map(application => ({ label: application, id: application })),
    ];
  }, [healthData, t]);

  const environmentNames = useMemo(
    () => getEnvironmentNames(healthData),
    [healthData],
  );

  const columns = useMemo<ColumnConfig<HealthV2TableRow>[]>(
    () => [
      {
        id: 'application',
        label: t('dashboardV2Page.columns.application'),
        isRowHeader: true,
        cell: item => (
          <Cell>
            <b>{item.application}</b>
          </Cell>
        ),
        width: '20%',
        minWidth: 160,
      },
      {
        id: 'component',
        label: t('dashboardV2Page.columns.component'),
        cell: item => <CellText title={item.component ?? '-'} />,
        width: '40%',
        minWidth: 240,
      },
      ...environmentNames.map(environment =>
        getEnvironmentColumn(environment, handleEnvironmentSelect, t),
      ),
    ],
    [environmentNames, handleEnvironmentSelect, t],
  );

  const tableRows = useMemo(
    () => buildHealthMatrix(healthData, selectedApplications),
    [healthData, selectedApplications],
  );

  const { tableProps } = useTable({
    mode: 'complete',
    data: tableRows,
    paginationOptions: {
      type: 'none',
    },
  });

  const emptyState = (
    <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
      {t('dashboardV2Page.emptyState')}
    </div>
  );

  return (
    <FullPage>
      <Header
        title={t('dashboardV2Page.title')}
        sticky
        customActions={
          <>
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
                        .filter(application => application !== ALL_APPLICATIONS_ID),
                  );
                }}
                aria-label={t('dashboardV2Page.filters.applicationLabel')}
                style={{ minWidth: '150px' }}
              />
              <Box style={{ display: 'flex', alignItems: 'center' }}>

                <Button
                  variant="secondary"
                  onClick={() => setReloadCount(count => count + 1)}
                  iconEnd={<RiRestartLine />}
                  isDisabled={isLoading}
                >
                  {t('dashboardV2Page.refresh.button')}
                </Button>
                <Select
                  onChange={selected => {
                    setRefreshInterval(parseInt(selected?.toString() ?? '0', 10));
                  }}
                  label=""
                  options={refreshIntervals}
                  value={refreshInterval.toString()}
                  aria-label={t('dashboardV2Page.refresh.intervalLabel')}
                />
              </Box>
            </Flex>
            <InformationPopup content={
              <InformationPopupContent
                text={t('dashboardV2Page.description')}
                comment={t('dashboardV2Page.statusDescription')}
              />
            } />
          </>
        }
      />
      <Container
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {healthDataErrors.map((sourceError, index) => (
          <ResponseErrorPanel
            key={`${sourceError.source}-${index}`}
            title={t('dashboardV2Page.errors.source', { source: sourceError.source })}
            error={new Error(sourceError.message)}
          />
        ))}
        {loadError && (
          <ResponseErrorPanel
            title={t('dashboardV2Page.errors.load')}
            error={loadError}
          />
        )}
        {isLoading ? (
          <Progress />
        ) : (
          <Table
            columnConfig={columns}
            {...tableProps}
            pagination={{ type: 'none' }}
            emptyState={emptyState}
            className={`denseTable ${styles.healthTable}`}
          />
        )}
      </Container>
      <HealthDetailsSheet
        selection={selectedEnvironment}
        onClose={() => setSelectedEnvironment(null)}
      />
    </FullPage>
  );
};
