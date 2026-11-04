import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { LoggerService } from '@backstage/backend-plugin-api';
import { McaService } from '../services';
import {
  CustomErrorBase,
  NotFoundError,
  ServiceUnavailableError,
  toError,
} from '@backstage/errors';
import {
  logMcpActionExecution,
  logMcpActionRegistration,
  READ_ONLY_ACTION_ATTRIBUTES,
} from '@internal/mcp-common/src';
import { mcaOutputSchemas } from './outputSchemas';

export function registerMcaComponentMcpActions(options: {
  actionsRegistry: ActionsRegistryService;
  logger: LoggerService;
  mcaService: McaService;
}) {
  const { actionsRegistry, logger, mcaService } = options;

  logMcpActionRegistration(logger, 'MCA Component');

  actionsRegistry.register({
    name: 'get-mca-component',
    title: 'MCA component metadata by exact name',
    description: `
      Look up one MCA component by its exact component identifier (name).
      Returns component metadata: component, prdVersion, p1Version, p2Version,
      p3Version, p4Version, applicationCode, and packageName. This is metadata,
      not the XML definition. Use get-mca-component-definition when you need
      the parsed definition for a release.
      All metadata is returned in one response without pagination, truncation
      or JSON chunking.
    `,
    attributes: READ_ONLY_ACTION_ATTRIBUTES,
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the component to query'),
        }),
      output: z => mcaOutputSchemas(z).component,
    },
    action: async ({ input }) => {
      logMcpActionExecution(logger, 'get-mca-component', input);

      const component = await mcaService.getMcaComponent({
        component: input.name,
      });
      if (!component) {
        throw new NotFoundError(`Component ${input.name} not found`);
      }
      return { output: { component } };
    },
  });

  actionsRegistry.register({
    name: 'get-mca-component-definition',
    title: 'MCA component definition by name and release',
    description: `
      Retrieve the parsed XML definition for an MCA operation or element,
      identified by its exact component identifier (name). Optional refP selects
      the P-release; when omitted, the component's prdVersion from its metadata
      is used. Returns definition with component and resolved refP, plus result
      containing the complete parsed operation analysis or element fields.
      All entries and values are returned in one response without pagination,
      truncation or JSON chunking. Returned refP can pin subsequent calls to
      the same release.
      JSON uses the frontend mapping: attributes
      have plain names, text content uses #text, repeated elements become
      arrays, and numeric/boolean text is converted. Use
      get-mca-component to discover metadata and available release versions.
    `,
    attributes: READ_ONLY_ACTION_ATTRIBUTES,
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the component to query'),
          refP: z
            .string()
            .optional()
            .describe('The P-release version of the component to query'),
        }),
      output: z => mcaOutputSchemas(z).definition,
    },
    action: async ({ input }) => {
      logMcpActionExecution(logger, 'get-mca-component-definition', input);
      let refP = input.refP;
      if (!refP) {
        const component = await mcaService.getMcaComponent({
          component: input.name,
        });
        if (!component) {
          throw new NotFoundError(`Component ${input.name} not found`);
        }
        refP = component?.prdVersion;
        if (!refP) {
          throw new NotFoundError(
            `No release version found for component ${input.name}`,
          );
        }
      }
      const { result, error } =
        await mcaService.getParsedMcaComponentDefinition({
          component: input.name,
          refP: refP,
        });

      if (error) {
        if (error instanceof CustomErrorBase) throw error;
        throw new ServiceUnavailableError(
          `Failed to fetch component definition: ${toError(error).message}`,
          error,
        );
      }
      if (result === undefined) {
        throw new NotFoundError(
          `Component definition for ${input.name} not found`,
        );
      }
      return {
        output: {
          definition: {
            component: input.name,
            refP,
          },
          result,
        },
      };
    },
  });
}
