import {
  AuditorService,
  coreServices,
  createServiceFactory,
} from '@backstage/backend-plugin-api';
import { DefaultAuditorService } from '@backstage/backend-defaults/auditor';

export function withMcpAnalytics(
  auditor: AuditorService,
  record: (toolName: string, outcome: 'succeeded' | 'failed') => Promise<void>,
): AuditorService {
  return {
    async createEvent(options) {
      const event = await auditor.createEvent(options);
      const toolName = options.meta?.toolName;
      if (
        options.eventId !== 'tool-execution' ||
        typeof toolName !== 'string'
      ) {
        return event;
      }
      return {
        async success(params) {
          await event.success(params);
          await record(toolName, 'succeeded');
        },
        async fail(params) {
          await event.fail(params);
          await record(toolName, 'failed');
        },
      };
    },
  };
}

export const mcpAnalyticsAuditor = createServiceFactory({
  service: coreServices.auditor,
  deps: {
    config: coreServices.rootConfig,
    logger: coreServices.logger,
    auth: coreServices.auth,
    httpAuth: coreServices.httpAuth,
    plugin: coreServices.pluginMetadata,
    discovery: coreServices.discovery,
  },
  factory({ config, logger, auth, httpAuth, plugin, discovery }) {
    const levels = {
      low: 'debug',
      medium: 'info',
      high: 'info',
      critical: 'info',
    } as const;
    const auditLogger = logger.child({ isAuditEvent: true });
    const resolveLevel = (
      severity: keyof typeof levels,
    ): 'debug' | 'info' | 'warn' | 'error' => {
      const level =
        config.getOptionalString(
          `backend.auditor.severityLogLevelMappings.${severity}`,
        ) ?? levels[severity];
      if (
        level !== 'debug' &&
        level !== 'info' &&
        level !== 'warn' &&
        level !== 'error'
      ) {
        throw new Error(`Invalid auditor log level for ${severity}: ${level}`);
      }
      return level;
    };
    const severityLevels = {
      low: resolveLevel('low'),
      medium: resolveLevel('medium'),
      high: resolveLevel('high'),
      critical: resolveLevel('critical'),
    };
    const auditor = DefaultAuditorService.create(
      event => {
        const level = severityLevels[event.severityLevel];
        if ('error' in event) {
          const { error, ...rest } = event;
          auditLogger
            .child(rest)
            [level](`${event.plugin}.${event.eventId}`, error);
        } else {
          auditLogger[level](`${event.plugin}.${event.eventId}`, event);
        }
      },
      { plugin, auth, httpAuth },
    );
    if (plugin.getId() !== 'mcp-actions') {
      return auditor;
    }

    return withMcpAnalytics(auditor, async (toolName, outcome) => {
      try {
        const baseUrl = await discovery.getBaseUrl('analytics');
        const credentials = await auth.getOwnServiceCredentials();
        const { token } = await auth.getPluginRequestToken({
          onBehalfOf: credentials,
          targetPluginId: 'analytics',
        });
        const response = await fetch(`${baseUrl}/mcp-events`, {
          method: 'POST',
          signal: AbortSignal.timeout(2000),
          headers: {
            authorization: `Bearer ${token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ toolName, outcome }),
        });
        if (!response.ok) {
          throw new Error(`Analytics endpoint returned ${response.status}`);
        }
      } catch (error) {
        logger.error(
          'Failed to record MCP analytics event',
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    });
  },
});
