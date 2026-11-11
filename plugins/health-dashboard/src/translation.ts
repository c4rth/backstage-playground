import {
  createTranslationRef,
  TranslationFunction,
} from '@backstage/frontend-plugin-api';

export const healthDashboardMetadata = {
  title: 'Health Dashboards',
  v1Title: 'Health Dashboards V1',
  v2Title: 'Health Dashboards V2',
  mockDescription:
    'Enable the mock health dashboard endpoint for testing purposes',
} as const;

export const healthDashboardTranslationRef = createTranslationRef({
  id: 'plugin.health-dashboards',
  messages: {
    dashboardV1Page: {
      title: 'Health Dashboard v1',
      description:
        'View the health dashboard for applications deployed in k8s. This screen displays each application and the health status reported for each environment.',
      statusDescription:
        'The health status reflects the response returned by the applications, helping you quickly identify which services are healthy and which require attention.',
      emptyState: 'No health data found.',
      applicationColumn: 'APPLICATION',
      refresh: {
        button: 'Refresh',
        intervalLabel: 'Auto-refresh interval',
        off: 'Off',
        fiveSeconds: '5s',
        tenSeconds: '10s',
        thirtySeconds: '30s',
        oneMinute: '1m',
        fiveMinutes: '5m',
      },
      legend: {
        label: 'Status color legend',
        title: 'Health Status',
        ok: 'OK',
        accepted: 'XXX',
        notFound: 'Not Found',
        unavailable: 'Unavailable',
        error: 'Error',
        other: 'other',
        item: '{{label}} ({{status}})',
      },
      details: {
        title: '{{application}} - {{environment}}',
        showHealth: 'Show {{environment}} health details for {{application}}',
      },
      errors: {
        source: 'Failed to get {{source}} health data',
        render: 'Failed to render Health data',
      },
    },
    dashboardV2Page: {
      title: 'Health Dashboard v2',
      description:
        'View application health by platform component and environment.',
      statusDescription:
        'For each environment, RED means at least one probe is red; GREEN means all probes are green. Other statuses are shown as UNKNOWN.',
      emptyState: 'No health data found.',
      filters: {
        applications: 'Applications',
        applicationLabel: 'Application',
        allApplications: 'All',
      },
      columns: {
        application: 'Application',
        component: 'Component',
      },
      details: {
        title: '{{application}} - {{environment}}',
        showHealth:
          'Show {{environment}} health details for {{application}} - {{component}}',
      },
      errors: {
        source: 'Failed to get {{source}} health data',
        load: 'Failed to load Health data',
        unknown: 'Unknown error',
      },
    },
    healthDetails: {
      close: 'Close health details',
    },
    api: {
      errors: {
        noV1Endpoints: 'No v1 probe endpoints configured',
        noV2Endpoints: 'No v2 probe endpoints configured',
        http: 'HTTP {{status}}: Failed to fetch health data - {{error}}',
        invalidResponse: 'Invalid response: expected health data object',
        fetch: 'Failed to get health data: {{error}}',
        unknown: 'Unknown error',
      },
    },
  },
});

export type HealthDashboardTranslator = TranslationFunction<
  typeof healthDashboardTranslationRef.T
>;
