import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { LoggerService } from '@backstage/backend-plugin-api';
import { McaService } from '../services';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

export function registerMcaComponentMcpActions(options: {
  actionsRegistry: ActionsRegistryService;
  logger: LoggerService;
  mcaService: McaService;
}) {
  const { actionsRegistry, logger, mcaService } = options;

  logger.info('Registering MCA Component MCP actions');

  actionsRegistry.register({
    name: 'get-mca-component',
    title: 'MCA Component Action',
    description: `
        Get MCA Component information.
        Provides detailed information about a specific MCA component: package name, versions, and other metadata.
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
    title: 'MCA Component Action',
    description: `
        Get MCA Component definition.
        An MCA component can be a MCA operation or a MCA element.
        Returns the XML definition as a JSON object using the frontend mapping:
        attributes have plain names, text content uses #text, and repeated elements
        become arrays. Numeric and boolean text values are converted automatically.
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
      let refP = input.refP || '';
      if (!input.refP) {
        const component = await mcaService.getMcaComponent({
          component: input.name,
        });
        if (!component) {
          throw new Error(`Component ${input.name} not found`);
        }
        refP = component?.prdVersion;
      }
      const componentDefinition = await mcaService.getMcaComponentDefinition({
        component: input.name,
        refP: refP,
      });

      if (!componentDefinition) {
        throw new Error(`Component definition for ${input.name} not found`);
      }
      const validation = XMLValidator.validate(componentDefinition, {
        allowBooleanAttributes: true,
      });
      if (validation !== true) {
        throw new Error(
          `Invalid XML definition for ${input.name}: ${validation.err.msg} (line ${validation.err.line})`,
        );
      }
      const xmlParser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        allowBooleanAttributes: true,
        trimValues: true,
        transformTagName: tagName => {
          if (tagName === 'constructor') {
            return '_constructor';
          }
          return tagName;
        },
      });
      const parsedDefinition: any = xmlParser.parse(componentDefinition);
      let output;
      if (parsedDefinition.OPERATION) {
        output =
          parsedDefinition['OPERATION']['SPECIFICATION']['OperationAnalyse'];
      } else {
        output = parsedDefinition['element']['fields'];
      }

      return {
        output: { output },
      };
    },
  });
}
