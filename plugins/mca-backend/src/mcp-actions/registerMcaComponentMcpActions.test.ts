import { LoggerService } from '@backstage/backend-plugin-api';
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { McaService } from '../services';
import { registerMcaComponentMcpActions } from './registerMcaComponentMcpActions';

describe('get-mca-component-definition', () => {
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
    jest.clearAllMocks();
    registerMcaComponentMcpActions({
      actionsRegistry,
      logger,
      mcaService,
    });
  });

  async function invoke() {
    const action = register.mock.calls
      .map(([options]) => options)
      .find(options => options.name === 'get-mca-component-definition');
    if (!action) {
      throw new Error('Definition action was not registered');
    }
    return action.action({
      input: { name: 'OperationTest', refP: 'P123' },
      secrets: undefined,
      logger,
      credentials: {
        $$type: '@backstage/BackstageCredentials',
        principal: { type: 'none' },
      },
    });
  }

  it('returns a JSON object using the frontend XML mapping', async () => {
    mcaService.getMcaComponentDefinition.mockResolvedValue(
      '<operation code="001"><field name="first">001</field><field name="second">false</field></operation>',
    );

    await expect(invoke()).resolves.toEqual({
      output: {
        componentDefinition: {
          operation: {
            code: '001',
            field: [
              { name: 'first', '#text': 1 },
              { name: 'second', '#text': false },
            ],
          },
        },
      },
    });
    expect(mcaService.getMcaComponentDefinition).toHaveBeenCalledWith({
      component: 'OperationTest',
      refP: 'P123',
    });
  });

  it('supports boolean attributes and constructor tags like the frontend', async () => {
    mcaService.getMcaComponentDefinition.mockResolvedValue(
      '<operation enabled><constructor> example </constructor></operation>',
    );

    await expect(invoke()).resolves.toEqual({
      output: {
        componentDefinition: {
          operation: { enabled: true, _constructor: 'example' },
        },
      },
    });
  });

  it.each(['OPERATION', 'ELEMENT'])(
    'returns the full %s definition without requiring nested properties',
    async root => {
      mcaService.getMcaComponentDefinition.mockResolvedValue(
        `<${root} name="example" />`,
      );

      await expect(invoke()).resolves.toEqual({
        output: {
          componentDefinition: {
            [root]: { name: 'example' },
          },
        },
      });
    },
  );

  it.each([undefined, ''])('rejects a missing definition (%s)', async xml => {
    mcaService.getMcaComponentDefinition.mockResolvedValue(xml);

    await expect(invoke()).rejects.toThrow(
      'Component definition for OperationTest not found',
    );
  });

  it('rejects malformed XML', async () => {
    mcaService.getMcaComponentDefinition.mockResolvedValue(
      '<operation><field></operation>',
    );

    await expect(invoke()).rejects.toThrow(
      'Invalid XML definition for OperationTest:',
    );
  });
});
