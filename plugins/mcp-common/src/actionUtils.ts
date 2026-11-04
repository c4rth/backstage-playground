import type { LoggerService } from '@backstage/backend-plugin-api';
import { JsonObject } from '@backstage/types';

export const READ_ONLY_ACTION_ATTRIBUTES = {
  destructive: false,
  readOnly: true,
  idempotent: true,
} as const;

export function logMcpActionRegistration(
  logger: Pick<LoggerService, 'info'>,
  actionGroup: string,
): void {
  logger.info(`Registering ${actionGroup} MCP actions`);
}

export function logMcpActionExecution(
  logger: Pick<LoggerService, 'debug'>,
  actionName: string,
  input: Error | JsonObject | undefined,
): void {
  logger.debug(`Executing ${actionName} action with input:`, input);
}
