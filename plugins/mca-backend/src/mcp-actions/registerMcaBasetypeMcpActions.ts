import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { LoggerService } from '@backstage/backend-plugin-api';
import { McaService } from '../services';
import { parseJavadoc } from './parseJavadoc';

export function registerMcaBasetypeMcpActions(options: {
  actionsRegistry: ActionsRegistryService;
  logger: LoggerService;
  mcaService: McaService;
}) {
  const { actionsRegistry, logger, mcaService } = options;

  logger.info('Registering MCA Basetype MCP actions');

  actionsRegistry.register({
    name: 'get-mca-basetype',
    title: 'MCA base-type Javadoc by exact name',
    description: `
      Retrieve parsed JavaDoc for the exact MCA base-type name (name). Returns
      javaDoc with baseType, packageName, title, signature, description,
      inheritance, documentation tags, fields, constructors, methods, and
      inheritedMembers. The full documentation is returned without pagination.
      Use this for base-type class documentation, not for an MCA component's
      XML definition; use get-mca-component-definition for that.
    `,
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the basetype to query'),
        }),
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug('Executing get-mca-basetype action with input:', input);

      const basetype = await mcaService.getMcaBaseType({
        baseType: input.name,
      });
      if (!basetype) {
        throw new Error(`Basetype not found: ${input.name}`);
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
