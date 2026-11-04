import {
  logMcpActionExecution,
  logMcpActionRegistration,
  READ_ONLY_ACTION_ATTRIBUTES,
} from './actionUtils';

describe('MCP action utilities', () => {
  it('provides shared read-only attributes', () => {
    expect(READ_ONLY_ACTION_ATTRIBUTES).toEqual({
      destructive: false,
      readOnly: true,
      idempotent: true,
    });
  });

  it('standardizes action registration and execution logging', () => {
    const logger = { info: jest.fn(), debug: jest.fn() };
    const input = { name: 'example' };

    logMcpActionRegistration(logger, 'Example');
    logMcpActionExecution(logger, 'get-example', input);

    expect(logger.info).toHaveBeenCalledWith('Registering Example MCP actions');
    expect(logger.debug).toHaveBeenCalledWith(
      'Executing get-example action with input:',
      input,
    );
  });
});
