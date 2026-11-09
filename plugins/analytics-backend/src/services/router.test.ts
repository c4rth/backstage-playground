import express from 'express';
import { AddressInfo } from 'node:net';
import { mockServices } from '@backstage/backend-test-utils';
import { createRouter } from './router';
import { AnalyticsService } from './types';

describe('MCP analytics routes', () => {
  const analyticsService: jest.Mocked<AnalyticsService> = {
    logAnalyticsEvent: jest.fn(),
    logMcpAction: jest.fn(),
    getMcpActions: jest.fn(),
    getTotalDailyUniqueVisitors: jest.fn(),
    getTopFeaturesByUniqueVisitors: jest.fn(),
  };
  const httpAuth = mockServices.httpAuth.mock();
  let baseUrl: string;
  let server: ReturnType<express.Application['listen']>;

  beforeAll(async () => {
    const app = express();
    app.use(await createRouter({ analyticsService, httpAuth }));
    await new Promise<void>(resolve => {
      server = app.listen(0, '127.0.0.1', resolve);
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve())),
    );
  });

  beforeEach(() => jest.clearAllMocks());

  it('accepts service-authenticated tool results without payloads', async () => {
    const response = await fetch(`${baseUrl}/mcp-events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        toolName: 'catalog.get-entity',
        outcome: 'succeeded',
      }),
    });
    expect(response.status).toBe(204);
    expect(httpAuth.credentials).toHaveBeenCalledWith(expect.anything(), {
      allow: ['service'],
    });
    expect(analyticsService.logMcpAction).toHaveBeenCalledWith(
      'catalog.get-entity',
      'succeeded',
    );
  });

  it('rejects invalid events and reporting periods', async () => {
    const event = await fetch(`${baseUrl}/mcp-events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ toolName: 'not valid', outcome: 'succeeded' }),
    });
    expect(event.status).toBe(400);
    expect(analyticsService.logMcpAction).not.toHaveBeenCalled();
    expect((await fetch(`${baseUrl}/metrics/mcp-actions?days=-1`)).status).toBe(
      400,
    );
  });

  it('returns tool counts for the selected date range', async () => {
    analyticsService.getMcpActions.mockResolvedValue([
      { toolName: 'catalog.get-entity', succeeded: 3, failed: 2 },
    ]);
    const response = await fetch(`${baseUrl}/metrics/mcp-actions?days=7`);
    expect(await response.json()).toEqual({
      actions: [{ toolName: 'catalog.get-entity', succeeded: 3, failed: 2 }],
    });
    expect(analyticsService.getMcpActions).toHaveBeenCalledWith(7);
  });
});
