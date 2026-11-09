import { McpActionMetric } from './types';

export function aggregateMcpActions(
  rows: { subject?: unknown; extension?: unknown; count?: unknown }[],
): McpActionMetric[] {
  const metrics = new Map<string, McpActionMetric>();

  for (const row of rows) {
    if (
      typeof row.subject !== 'string' ||
      (row.extension !== 'succeeded' && row.extension !== 'failed') ||
      (typeof row.count !== 'number' && typeof row.count !== 'string')
    ) {
      throw new Error('Invalid MCP analytics data');
    }

    const count = Number(row.count);
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new Error('Invalid MCP analytics count');
    }

    let metric = metrics.get(row.subject);
    if (!metric) {
      metric = { toolName: row.subject, succeeded: 0, failed: 0 };
      metrics.set(row.subject, metric);
    }
    if (row.extension === 'succeeded') {
      metric.succeeded += count;
    } else {
      metric.failed += count;
    }
  }

  return [...metrics.values()].sort(
    (a, b) => b.succeeded + b.failed - a.succeeded - a.failed,
  );
}
