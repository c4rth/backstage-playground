import { ResponseErrorPanel } from '@backstage/core-components';
import {
  Cell,
  ColumnConfig,
  Container,
  FullPage,
  Grid,
  Header,
  Select,
  Table,
  useTable,
  ButtonIcon,
  Row,
  CellText,
} from '@backstage/ui';
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { RiInfoCardLine } from '@remixicon/react';
import { HealthDataError, HealthV2Data, HealthV2Probe } from '../../types';
import { useGetHealthV2Data } from '../../hooks';

import {
  InformationPopup,
  InformationPopupContent,
  Chip,
  Progress,
  useDocumentTitle,
} from '@internal/plugin-components-react';
import styles from './HealthDashboardV2Page.module.css';

const POPUP_CONTENT = (
  <InformationPopupContent
    text1="View the health dashboard for applications deployed in k8s. This screen displays each application and the health status reported for each environment."
    text2="The health status reflects the response returned by the applications, helping you quickly identify which services are healthy and which require attention."
  />
);

const ALL_OPTION = { label: 'All', id: 'All' };

const ALL_ENVIRONMENTS = [
  ALL_OPTION,
  { label: 'PRD', id: 'PRD' },
  { label: 'PTP', id: 'PTP' },
  { label: 'UAT', id: 'UAT' },
  { label: 'GTU', id: 'GTU' },
  { label: 'TST', id: 'TST' },
];

type HealthV2TableRow = HealthV2Probe & {
  id: number;
  isExpanded: boolean;
  toggleDetails: () => void;
};

const ExpandedDetails = ({ probe }: { probe: HealthV2TableRow }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>(0);

  useLayoutEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, []);

  return (
    <div
      ref={contentRef}
      className={styles.detailsContent}
      style={{
        height,
        opacity: height === 0 ? 0 : 1,
      }}
      onTransitionEnd={event => {
        if (event.propertyName === 'height') {
          setHeight('auto');
        }
      }}
    >
      <pre>{JSON.stringify(probe, null, 2)}</pre>
    </div>
  );
};

const getTechnicalStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'GREEN':
      return '#4caf50';
    case 'RED':
      return '#f44336';
    default:
      return 'default';
  }
};

const getEnvironmentColor = (environment: string): string => {
  switch (environment.toUpperCase()) {
    case 'PRD':
      return '#d1fae5';
    case 'PTP':
      return '#dbeafe';
    case 'UAT':
      return '#fef3c7';
    case 'GTU':
      return '#ede9fe';
    case 'TST':
      return '#e5e7eb';
    default:
      return 'default';
  }
};

const columns: ColumnConfig<HealthV2TableRow>[] = [
  {
    id: 'environment',
    label: 'Env',
    isRowHeader: true,
    cell: item => (
      <Cell>
        <Chip
          label={item.environment}
          chipColor={getEnvironmentColor(item.environment)}
          size="small"
        />
      </Cell>
    ),
    width: '3%',
  },
  {
    id: 'application',
    label: 'DEFL',
    cell: item => (
      <Cell>
        <b>{item.application}</b>
      </Cell>
    ),
    width: '5%',
  },
  {
    id: 'platformComponent',
    label: 'Platform',
    cell: item => <CellText title={item.platformComponent ?? '-'} />,
    width: '10%',
  },
  {
    id: 'component',
    label: 'Component',
    cell: item => <CellText title={item.component} />,
    width: '15%',
  },
  {
    id: 'region',
    label: 'Region',
    cell: item => <CellText title={item.region ?? '-'} />,
    width: '5%',
  },
  {
    id: 'technicalStatus',
    label: 'Status',
    cell: item => (
      <Cell>
        <Chip
          label={item.httpStatusCode}
          chipColor={getTechnicalStatusColor(item.technicalStatus)}
          size="small"
          style={{ minWidth: '40px' }}
        />
      </Cell>
    ),
    width: '5%',
  },
  {
    id: 'response',
    label: 'Response',
    cell: item => {
      const response = item.response ?? '-';

      return (
        <Cell>
          <div
            title={item.response ?? undefined}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {response}
          </div>
        </Cell>
      );
    },
    width: '50%',
  },
  {
    id: 'details',
    label: '',
    cell: item => (
      <Cell>
        <ButtonIcon
          size="small"
          variant="tertiary"
          icon={<RiInfoCardLine />}
          aria-label={`${
            item.isExpanded ? 'Hide' : 'Show'
          } details for ${item.application}`}
          aria-expanded={item.isExpanded}
          onClick={item.toggleDetails}
        />
      </Cell>
    ),
    width: '3%',
  },
];

export const HealthDashboardV2Page = () => {
  useDocumentTitle('Health Dashboard v2');

  const getHealthData = useGetHealthV2Data();
  const [healthData, setHealthData] = useState<HealthV2Data>({});
  const [selectedEnvironment, setSelectedEnvironment] = useState('All');
  const [selectedApplication, setSelectedApplication] = useState('All');
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [healthDataErrors, setHealthDataErrors] = useState<HealthDataError[]>(
    [],
  );
  const [loadError, setLoadError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredHealthData = useMemo(() => {
    const environments =
      selectedEnvironment === 'All'
        ? Object.entries(healthData)
        : Object.entries(healthData).filter(
            ([environment]) => environment === selectedEnvironment,
          );
    const filtered: HealthV2Data = {};

    environments.forEach(([environment, groups]) => {
      Object.entries(groups).forEach(([group, applications]) => {
        const matchingApplications = Object.fromEntries(
          Object.entries(applications).filter(
            ([, probe]) =>
              selectedApplication === 'All' ||
              probe.application === selectedApplication,
          ),
        );

        if (Object.keys(matchingApplications).length > 0) {
          filtered[environment] ??= {};
          filtered[environment][group] = matchingApplications;
        }
      });
    });

    return filtered;
  }, [healthData, selectedApplication, selectedEnvironment]);

  const toggleDetails = useCallback((rowId: number) => {
    setExpandedRowId(currentRowId => (currentRowId === rowId ? null : rowId));
  }, []);

  const tableRows = useMemo(() => {
    let id = 0;

    return Object.entries(filteredHealthData).flatMap(([environment, groups]) =>
      Object.values(groups).flatMap(applications =>
        Object.values(applications).map(probe => {
          const rowId = id++;
          return {
            ...probe,
            environment,
            id: rowId,
            isExpanded: expandedRowId === rowId,
            toggleDetails: () => toggleDetails(rowId),
          };
        }),
      ),
    );
  }, [expandedRowId, filteredHealthData, toggleDetails]);

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
        customActions={<InformationPopup content={POPUP_CONTENT} />}
      />
      <Container>
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
        <Grid.Root columns="2" gap="10" mt="4" mb="4">
          <Grid.Item>
            <Select
              label="Environment"
              search
              options={ALL_ENVIRONMENTS}
              value={selectedEnvironment}
              onChange={selected => {
                setSelectedEnvironment(selected?.toString() ?? 'All');
                setExpandedRowId(null);
              }}
              aria-label="Environment"
            />
          </Grid.Item>
          <Grid.Item>
            <Select
              label="Application"
              search
              options={applicationOptions}
              value={selectedApplication}
              onChange={selected => {
                setSelectedApplication(selected?.toString() ?? 'All');
                setExpandedRowId(null);
              }}
              aria-label="Application"
            />
          </Grid.Item>
        </Grid.Root>
        {isLoading ? (
          <Progress />
        ) : (
          <>
            <Table
              columnConfig={columns}
              {...tableProps}
              rowConfig={({ item }) => (
                <Fragment key={item.id}>
                  <Row
                    id={String(item.id)}
                    columns={columns}
                    children={column => column.cell(item)}
                  />
                  {item.isExpanded && (
                    <Row
                      id={`details-${item.id}`}
                      columns={[
                        {
                          id: 'full-details',
                          label: 'Details',
                          cell: (detailItem: HealthV2TableRow) => (
                            <Cell colSpan={columns.length}>
                              <ExpandedDetails probe={detailItem} />
                            </Cell>
                          ),
                        },
                      ]}
                      children={column => column.cell(item)}
                    />
                  )}
                </Fragment>
              )}
              pagination={{ type: 'none' }}
              emptyState={emptyState}
              className={`denseTable ${styles.healthTable}`}
            />
          </>
        )}
      </Container>
    </FullPage>
  );
};
