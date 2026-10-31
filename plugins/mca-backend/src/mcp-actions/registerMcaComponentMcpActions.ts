import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { LoggerService } from '@backstage/backend-plugin-api';
import { McaService } from '../services';

export function registerMcaComponentMcpActions(options: {
  actionsRegistry: ActionsRegistryService;
  logger: LoggerService;
  mcaService: McaService;
}) {
  const { actionsRegistry, logger, mcaService } = options;

  logger.info('Registering MCA Component MCP actions');

  actionsRegistry.register({
    name: 'get-mca-component',
    title: 'MCA component metadata by exact name',
    description: `
      Look up one MCA component by its exact component identifier (name).
      Returns component metadata: component, prdVersion, p1Version, p2Version,
      p3Version, p4Version, applicationCode, and packageName. This is metadata,
      not the XML definition. Use get-mca-component-definition when you need
      the parsed definition for a release.
    `,
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the component to query'),
        }),
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug('Executing get-mca-component action with input:', input);

      const component = await mcaService.getMcaComponent({
        component: input.name,
      });
      return {
        output: { component },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-mca-component-definition',
    title: 'MCA component definition by name and release',
    description: `
      Retrieve the parsed XML definition for an MCA operation or element,
      identified by its exact component identifier (name). Optional refP selects
      the P-release; when omitted, the component's prdVersion from its metadata
      is used. Returns result as JSON using the frontend mapping: attributes
      have plain names, text content uses #text, repeated elements become
      arrays, and numeric/boolean text is converted. Use
      get-mca-component to discover metadata and available release versions.
    `,
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the component to query'),
          refP: z
            .string()
            .optional()
            .describe('The P-release version of the component to query'),
        }),
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug(
        'Executing get-mca-component-definition action with input:',
        input,
      );
      let refP = input.refP;
      if (!refP) {
        const component = await mcaService.getMcaComponent({
          component: input.name,
        });
        if (!component) {
          throw new Error(`Component ${input.name} not found`);
        }
        refP = component?.prdVersion;
      }
      const { result, error } =
        await mcaService.getParsedMcaComponentDefinition({
          component: input.name,
          refP: refP,
        });

      if (error) {
        throw error;
      }

      return {
        output: { result },
      };
    },
  });
}
