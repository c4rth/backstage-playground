import { ResponseErrorPanel } from '@backstage/core-components';
import {
  Cell,
  ColumnConfig,
  Container,
  FullPage,
  Flex,
  Header,
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
import { HealthDataError, HealthV2Data } from '../../types';
import { useGetHealthV2Data } from '../../hooks';

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

const POPUP_CONTENT = (
  <InformationPopupContent
    text1="View application health by platform component and environment."
    text2="For each environment, RED means at least one probe is red; GREEN means all probes are green. Other statuses are shown as UNKNOWN."
  />
);

const ALL_OPTION = { label: 'All', id: 'All' };

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

const identityColumns: ColumnConfig<HealthV2TableRow>[] = [
  {
    id: 'application',
    label: 'Application',
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
    label: 'Component',
    cell: item => <CellText title={item.component ?? '-'} />,
    width: '40%',
    minWidth: 240,
  },
];

function getEnvironmentColumn(
  environment: string,
  onSelect: (row: HealthV2TableRow, environment: string) => void,
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
              aria-label={`Show ${environment} health details for ${item.application} - ${item.component ?? '-'}`}
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
  useDocumentTitle('Health Dashboard v2');

  const getHealthData = useGetHealthV2Data();
  const [healthData, setHealthData] = useState<HealthV2Data>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedApplications = useMemo(
    () =>
      (searchParams.get('application') ?? '')
        .split(',')
        .filter(application => application && application !== ALL_OPTION.id),
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
          title: `${row.application} - ${environment}`,
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
    [],
  );

  useEffect(() => {
    let isMounted = true;

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
            error instanceof Error ? error : new Error('Unknown error'),
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
  }, [getHealthData]);

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
      ALL_OPTION,
      ...Array.from(applications)
        .sort((left, right) => left.localeCompare(right))
        .map(application => ({ label: application, id: application })),
    ];
  }, [healthData]);

  const environmentNames = useMemo(
    () => getEnvironmentNames(healthData),
    [healthData],
  );

  const columns = useMemo(
    () => [
      ...identityColumns,
      ...environmentNames.map(environment =>
        getEnvironmentColumn(environment, handleEnvironmentSelect),
      ),
    ],
    [environmentNames, handleEnvironmentSelect],
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
      No health data found.
    </div>
  );

  return (
    <FullPage>
      <Header
        title="Health Dashboard v2"
        sticky
        customActions={
          <>
            <Flex style={{ alignItems: 'center' }}>
              <Text>Applications</Text>
              <Select
                label=""
                search
                selectionMode="multiple"
                options={applicationOptions}
                value={
                  selectedApplications.length
                    ? selectedApplications
                    : [ALL_OPTION.id]
                }
                onChange={selected => {
                  updateApplications(
                    selected.includes(ALL_OPTION.id) &&
                      selectedApplications.length > 0
                      ? []
                      : selected
                          .map(String)
                          .filter(application => application !== ALL_OPTION.id),
                  );
                }}
                aria-label="Application"
                style={{ minWidth: '150px' }}
              />
            </Flex>
            <InformationPopup content={POPUP_CONTENT} />
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
            title={`Failed to get ${sourceError.source} health data`}
            error={new Error(sourceError.message)}
          />
        ))}
        {loadError && (
          <ResponseErrorPanel
            title="Failed to load Health data"
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
