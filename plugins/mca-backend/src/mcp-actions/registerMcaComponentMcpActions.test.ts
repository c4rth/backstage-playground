import { LoggerService } from '@backstage/backend-plugin-api';
import { z } from 'zod/v3';
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { McaService } from '../services';
import { registerMcaComponentMcpActions } from './registerMcaComponentMcpActions';
import { McaComponentService } from '../services/McaComponentService';

const MAX_RESPONSE_BYTES = 32768;

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
    getParsedMcaComponentDefinition: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    registerMcaComponentMcpActions({
      actionsRegistry,
      logger,
      mcaService,
    });
  });

  async function invoke(input: Record<string, string | number | boolean> = {}) {
    const action = register.mock.calls
      .map(([options]) => options)
      .find(options => options.name === 'get-mca-component-definition');
    if (!action) {
      throw new Error('Definition action was not registered');
    }
    const result = await action.action({
      input: { name: 'OperationTest', refP: 'P123', ...input },
      secrets: undefined,
      logger,
      credentials: {
        $$type: '@backstage/BackstageCredentials',
        principal: { type: 'none' },
      },
    });
    expect(action.schema.output(z).parse(result.output)).toEqual(result.output);
    return result;
  }

  it('returns complete component metadata without chunking even above the shared budget', async () => {
    const component = {
      component: 'OperationTest',
      prdVersion: 'P123',
      p1Version: 'P124',
      p2Version: 'P125',
      p3Version: 'P126',
      p4Version: 'P127',
      applicationCode: 'demo',
      packageName: 'x'.repeat(MAX_RESPONSE_BYTES),
    };
    mcaService.getMcaComponent.mockResolvedValue(component);
    const metadataAction = register.mock.calls
      .map(([options]) => options)
      .find(options => options.name === 'get-mca-component');
    if (!metadataAction) throw new Error('Metadata action was not registered');
    const { output } = await metadataAction.action({
      input: { name: 'OperationTest' },
      secrets: undefined,
      logger,
      credentials: {
        $$type: '@backstage/BackstageCredentials',
        principal: { type: 'none' },
      },
    });
    expect(output).toEqual({ component });
    expect(metadataAction.schema.output(z).parse(output)).toEqual(output);
    expect(Buffer.byteLength(JSON.stringify(output))).toBeGreaterThan(
      MAX_RESPONSE_BYTES,
    );
    expect(output).not.toHaveProperty('format');
    expect(mcaService.getMcaComponent).toHaveBeenCalledWith({
      component: 'OperationTest',
    });
  });

  it('returns every definition entry with complete values in one response', async () => {
    const fields = Array.from({ length: 237 }, (_, i) => ({
      name: `field${i}`,
      '#text': 'Documentation'.repeat(1000),
    }));
    mcaService.getParsedMcaComponentDefinition.mockResolvedValue({
      result: { field: fields },
    });
    const { output } = await invoke();
    expect(output).toEqual({
      definition: { component: 'OperationTest', refP: 'P123' },
      result: { field: fields },
    });
    expect(Buffer.byteLength(JSON.stringify(output))).toBeGreaterThan(
      MAX_RESPONSE_BYTES,
    );
    expect(output).not.toHaveProperty('format');
    expect(mcaService.getParsedMcaComponentDefinition).toHaveBeenCalledWith({
      component: 'OperationTest',
      refP: 'P123',
    });
  });

  it('preserves arbitrary keys and falsy values without projection', async () => {
    mcaService.getParsedMcaComponentDefinition.mockResolvedValue({
      result: { 'a/b~c': false, empty: '', zero: 0, nullable: null },
    });
    await expect(invoke()).resolves.toMatchObject({
      output: {
        result: { 'a/b~c': false, empty: '', zero: 0, nullable: null },
      },
    });
  });

  it('returns oversized text without chunking', async () => {
    const text = '\u6F22\u{1F680}"'.repeat(30000);
    mcaService.getParsedMcaComponentDefinition.mockResolvedValue({
      result: { text },
    });
    const { output } = await invoke();
    expect(output).toMatchObject({ result: { text } });
    expect(Buffer.byteLength(JSON.stringify(output))).toBeGreaterThan(
      MAX_RESPONSE_BYTES,
    );
    expect(output).not.toHaveProperty('format');
    expect(output).not.toHaveProperty('nextOffset');
  });

  it('pins the default release and propagates missing results and parse failures', async () => {
    mcaService.getMcaComponent.mockResolvedValue({
      component: 'OperationTest',
      prdVersion: 'P456',
      p1Version: 'P457',
      p2Version: 'P458',
      p3Version: 'P459',
      p4Version: 'P460',
      applicationCode: 'demo',
      packageName: 'demo',
    });
    mcaService.getParsedMcaComponentDefinition.mockResolvedValue({
      result: [],
    });
    await expect(invoke({ refP: '' })).resolves.toMatchObject({
      output: {
        definition: { refP: 'P456' },
        result: [],
      },
    });
    mcaService.getParsedMcaComponentDefinition.mockResolvedValue({
      error: new Error('Invalid XML'),
    });
    await expect(invoke()).rejects.toThrow('Invalid XML');
    mcaService.getParsedMcaComponentDefinition.mockResolvedValue({});
    await expect(invoke()).rejects.toThrow('not found');
  });

  it.each([
    '<OPERATION><SPECIFICATION><OperationAnalyse><field name="first">001</field><field name="second">false</field></OperationAnalyse></SPECIFICATION></OPERATION>',
    '<element><fields><field name="first">001</field><field name="second">false</field></fields></element>',
  ])('parses either supported XML root: %s', async xml => {
    const result =
      await McaComponentService.prototype.getParsedMcaComponentDefinition.call(
        {
          getMcaComponentDefinition: jest.fn().mockResolvedValue(xml),
        },
        { component: 'OperationTest', refP: 'P123' },
      );
    expect(result).toEqual({
      result: {
        field: [
          { name: 'first', '#text': 1 },
          { name: 'second', '#text': false },
        ],
      },
    });
  });
});
