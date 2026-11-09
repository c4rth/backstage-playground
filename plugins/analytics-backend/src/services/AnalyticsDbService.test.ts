import { mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import { AnalyticsStore } from '../database';
import { AnalyticsDbService } from './AnalyticsDbService';

describe('MCP analytics storage', () => {
  it('stores anonymous calls without caller identity, inputs or outputs', async () => {
    const store: jest.Mocked<AnalyticsStore> = {
      storeAnalyticsEvent: jest.fn().mockResolvedValue(undefined),
      getTotalDailyUniqueVisitors: jest.fn(),
      getTopFeaturesByUniqueVisitors: jest.fn(),
      getMcpActions: jest.fn(),
      deleteOldAnalyticsData: jest.fn(),
    };
    const service = new AnalyticsDbService({
      logger: mockServices.logger.mock(),
      scheduler: mockServices.scheduler.mock(),
      config: new ConfigReader({
        analytics: { schedule: { frequency: 'PT5M', timeout: 'PT15M' } },
      }),
      analyticsStore: store,
    });
    await service.logMcpAction('catalog.get-entity', 'failed');
    expect(store.storeAnalyticsEvent).toHaveBeenCalledWith(
      'guest-mcp-anonymous',
      {
        action: 'mcp-tool-call',
        subject: 'catalog.get-entity',
        context: { pluginId: 'mcp-actions', extension: 'failed' },
      },
    );
    await service.getMcpActions(7);
    expect(store.getMcpActions).toHaveBeenCalledWith(7);
  });
});
