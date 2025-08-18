import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { ApiPlatformService } from '../services/ApiPlatformService/types';

export const createApiPlatformActions = ({
    actionsRegistry,
    apiPlatformService,
}: {
    actionsRegistry: ActionsRegistryService;
    apiPlatformService: ApiPlatformService;
}) => {
    actionsRegistry.register({
        name: 'greet-user',
        title: 'Greet User',
        description: 'Generate a personalized greeting',
        schema: {
            input: z =>
                z.object({
                    name: z.string().describe('The name of the person to greet'),
                }),
            output: z =>
                z.object({
                    greeting: z.string().describe('The generated greeting'),
                }),
        },
        action: async ({ input }) => ({
            output: { greeting: `Hello ${input.name}!` },
        }),
    });

    actionsRegistry.register({
        name: 'fetch-apis',
        title: 'Fetch APIs',
        description: 'Fetch a list of APIs from the api-platform',
        schema: {
            input: z =>
                z.object({
                    applicationCode: z.string().describe('The code of the application'),
                }),
            output: z =>
                z.object({
                    apis: z.any().describe('The list of APIs'),
                }),
        },
        action: async ({ input }) => {
            const apis = await apiPlatformService.listApis({});
            return { output: { apis } };
        },
    });

    return actionsRegistry;
};