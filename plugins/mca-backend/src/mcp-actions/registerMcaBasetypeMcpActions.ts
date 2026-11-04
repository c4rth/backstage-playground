import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { LoggerService } from '@backstage/backend-plugin-api';
import { McaService } from '../services';
import { parseJavadoc } from './parseJavadoc';
import { NotFoundError } from '@backstage/errors';
import {
  logMcpActionExecution,
  logMcpActionRegistration,
  READ_ONLY_ACTION_ATTRIBUTES,
} from '@internal/mcp-common/src';
import { mcaOutputSchemas } from './outputSchemas';

export function registerMcaBasetypeMcpActions(options: {
  actionsRegistry: ActionsRegistryService;
  logger: LoggerService;
  mcaService: McaService;
}) {
  const { actionsRegistry, logger, mcaService } = options;

  logMcpActionRegistration(logger, 'MCA Basetype');

  actionsRegistry.register({
    name: 'get-mca-basetype',
    title: 'MCA base-type Javadoc by exact name',
    description: `
      Retrieve complete parsed Javadoc by exact MCA base-type name (name).
      Returns javaDoc with baseType, packageName, title, signature, description,
      inheritance, tags, fields, constructors, methods and inheritedMembers.
      All sections and members, including their descriptions and tags, are
      returned in one response without pagination, truncation or JSON chunking.
      Use this for base-type class documentation, not for an MCA component's
      XML definition; use get-mca-component-definition for that.
    `,
    attributes: READ_ONLY_ACTION_ATTRIBUTES,
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the basetype to query'),
        }),
      output: z => mcaOutputSchemas(z).basetype,
    },
    action: async ({ input }) => {
      logMcpActionExecution(logger, 'get-mca-basetype', input);

      const basetype = await mcaService.getMcaBaseType({
        baseType: input.name,
      });
      if (!basetype) {
        throw new NotFoundError(`Basetype ${input.name} not found`);
      }
      const javaDoc = await mcaService.getMcaBaseTypeJavadoc({
        baseType: basetype.baseType,
        packageName: basetype.packageName,
      });
      const parsedJavadoc = parseJavadoc(javaDoc);
      return {
        output: {
          javaDoc: {
            baseType: basetype.baseType,
            packageName: basetype.packageName,
            ...parsedJavadoc,
          },
        },
      };
    },
  });
}
