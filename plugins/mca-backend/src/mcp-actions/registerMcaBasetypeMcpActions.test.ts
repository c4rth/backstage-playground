import { LoggerService } from '@backstage/backend-plugin-api';
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { McaService } from '../services';
import { registerMcaBasetypeMcpActions } from './registerMcaBasetypeMcpActions';

describe('get-mca-basetype', () => {
  const actionsRegistry: ActionsRegistryService = { register: jest.fn() };
  const register = jest.mocked(actionsRegistry.register);
  const logger: LoggerService = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn(),
  };
  const mcaService: jest.Mocked<McaService> = {
    getMcaComponentsCount: jest.fn(),
    listMcaComponents: jest.fn(),
    getMcaComponent: jest.fn(),
    getMcaComponentDefinition: jest.fn(),
    getMcaVersions: jest.fn(),
    listMcaBaseTypes: jest.fn(),
    getMcaBaseTypesCount: jest.fn(),
    getMcaBaseType: jest.fn(),
    getMcaBaseTypeJavadoc: jest.fn(),
    getMcaBaseTypeJavadocAsset: jest.fn(),
    getLastModifiedDate: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    registerMcaBasetypeMcpActions({ actionsRegistry, logger, mcaService });
    mcaService.getMcaBaseType.mockResolvedValue({
      baseType: 'Example',
      packageName: 'demo',
    });
    mcaService.getMcaBaseTypeJavadoc.mockResolvedValue(`
      <div class="description"><ul class="blockList"><li class="blockList">
        <pre>public class Example</pre><div class="block">Example API.</div>
      </li></ul></div>
    `);
  });

  function action() {
    const registered = register.mock.calls[0][0];
    return {
      registered,
      invoke: () =>
        registered.action({
          input: { name: 'Example' },
          secrets: undefined,
          logger,
          credentials: {
            $$type: '@backstage/BackstageCredentials',
            principal: { type: 'none' },
          },
        }),
    };
  }

  it('returns structured JSON instead of HTML', async () => {
    const { invoke } = action();
    const result = await invoke();
    expect(result.output).toMatchObject({
      javaDoc: {
        baseType: 'Example',
        packageName: 'demo',
        signature: 'public class Example',
        description: 'Example API.',
        methods: [],
      },
    });
    expect(JSON.stringify(result.output)).not.toContain('<');
    expect(mcaService.getMcaBaseTypeJavadoc).toHaveBeenCalledWith({
      baseType: 'Example',
      packageName: 'demo',
    });
  });

  it('rejects a missing basetype', async () => {
    mcaService.getMcaBaseType.mockResolvedValue(undefined);
    await expect(action().invoke()).rejects.toThrow(
      'Basetype not found: Example',
    );
    expect(mcaService.getMcaBaseTypeJavadoc).not.toHaveBeenCalled();
  });

  it('propagates fetch and parsing failures', async () => {
    mcaService.getMcaBaseTypeJavadoc.mockRejectedValueOnce(
      new Error('Fetch failed'),
    );
    await expect(action().invoke()).rejects.toThrow('Fetch failed');
    mcaService.getMcaBaseTypeJavadoc.mockResolvedValue(
      '<body>Not found</body>',
    );
    await expect(action().invoke()).rejects.toThrow('Invalid Javadoc');
  });
});
