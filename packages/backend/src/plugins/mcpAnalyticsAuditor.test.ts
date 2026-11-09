import { AuditorService } from '@backstage/backend-plugin-api';
import { withMcpAnalytics } from './mcpAnalyticsAuditor';

describe('MCP analytics auditor', () => {
  const success = jest.fn().mockResolvedValue(undefined);
  const fail = jest.fn().mockResolvedValue(undefined);
  const createEvent = jest.fn().mockResolvedValue({ success, fail });
  const auditor: AuditorService = { createEvent };
  const record = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('records successful and failed tool calls after auditing', async () => {
    const wrapped = withMcpAnalytics(auditor, record);
    const event = await wrapped.createEvent({
      eventId: 'tool-execution',
      meta: { toolName: 'catalog.get-entity' },
    });
    await event.success();
    const error = new Error('failed');
    await event.fail({ error });

    expect(success).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledWith({ error });
    expect(record.mock.calls).toEqual([
      ['catalog.get-entity', 'succeeded'],
      ['catalog.get-entity', 'failed'],
    ]);
  });

  it('does not record other audit events or events without a tool name', async () => {
    const wrapped = withMcpAnalytics(auditor, record);
    await (await wrapped.createEvent({ eventId: 'tool-discovery' })).success();
    await (await wrapped.createEvent({ eventId: 'tool-execution' })).success();
    expect(success).toHaveBeenCalledTimes(2);
    expect(record).not.toHaveBeenCalled();
  });

  it('preserves audit errors and does not record an incomplete audit', async () => {
    const error = new Error('audit failed');
    success.mockRejectedValueOnce(error);
    const wrapped = withMcpAnalytics(auditor, record);
    const event = await wrapped.createEvent({
      eventId: 'tool-execution',
      meta: { toolName: 'example.action' },
    });
    await expect(event.success()).rejects.toThrow(error);
    expect(record).not.toHaveBeenCalled();
  });
});
