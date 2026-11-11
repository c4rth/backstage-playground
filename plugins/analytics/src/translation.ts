import {
  createTranslationRef,
  TranslationFunction,
} from '@backstage/frontend-plugin-api';

export const analyticsMetadata = {
  title: 'Analytics',
} as const;

export const analyticsTranslationRef = createTranslationRef({
  id: 'plugin.analytics',
  messages: {
    content: {
      dateRange: 'Date Range',
      today: 'Today',
      lastDay: 'Last 24 hours',
      lastWeek: 'Last 7 days',
      lastTwoWeeks: 'Last 14 days',
      lastMonth: 'Last 30 days',
      loadError: 'Failed to load analytics metrics',
      apiError: 'Failed to call Analytics API',
      topFeatures: 'Top Features',
      mcpActions: 'MCP Actions',
    },
    dailyUsers: {
      title: 'Daily unique users',
      empty: 'No daily unique user data yet.',
      visitors: 'visitors',
      guests: 'guests',
      total: 'Total: {{total}}',
      tooltipEntry: '• {{name}}: {{value}}',
    },
    topFeatures: {
      title: 'Top features by unique visitors ({{total}})',
      empty: 'No feature navigation data yet.',
      columns: {
        featureName: 'Feature Name',
        uniqueVisitors: 'Unique Visitors',
        totalHits: 'Total Hits',
      },
    },
    mcpActions: {
      title: 'MCP tool calls',
      empty: 'No MCP tool calls yet.',
      columns: {
        toolName: 'MCP tool',
        succeeded: 'Succeeded',
        failed: 'Failed',
      },
    },
  },
});

export type AnalyticsTranslator = TranslationFunction<
  typeof analyticsTranslationRef.T
>;
