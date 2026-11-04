import { LoggerService } from '@backstage/backend-plugin-api';
import { z } from 'zod/v3';
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { McaService } from '../services';
import { registerMcaBasetypeMcpActions } from './registerMcaBasetypeMcpActions';
import { NotFoundError } from '@backstage/errors';

const MAX_RESPONSE_BYTES = 32768;

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
    getParsedMcaComponentDefinition: jest.fn(),
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
      invoke: async (input: Record<string, string | number | boolean> = {}) => {
        const result = await registered.action({
          input: { name: 'Example', ...input },
          secrets: undefined,
          logger,
          credentials: {
            $$type: '@backstage/BackstageCredentials',
            principal: { type: 'none' },
          },
        });
        expect(registered.schema.output(z).parse(result.output)).toEqual(
          result.output,
        );
        return result;
      },
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
        fields: [],
        constructors: [],
        inheritance: [],
        tags: [],
        inheritedMembers: [],
      },
    });
    expect(JSON.stringify(result.output)).not.toContain('<');
    expect(result.output).not.toHaveProperty('page');
    expect(result.output).not.toHaveProperty('format');
    expect(mcaService.getMcaBaseTypeJavadoc).toHaveBeenCalledWith({
      baseType: 'Example',
      packageName: 'demo',
    });
  });

  it('returns every member with complete documentation in one response', async () => {
    const methods = Array.from({ length: 237 }, (_, i) => ({
      name: `method${i}`,
      signature: `public void method${i}()`,
      description: `Documentation ${i}.`,
    }));
    mcaService.getMcaBaseTypeJavadoc.mockResolvedValue(`
      <section class="class-description"><div class="type-signature">public class Example</div></section>
      <section class="method-details">${methods
        .map(
          m => `
        <section class="detail"><h3>${m.name}</h3><div class="member-signature">${m.signature}</div>
        <div class="block">${m.description}</div></section>`,
        )
        .join('')}</section>
    `);
    const { output } = await action().invoke();
    expect(output).toMatchObject({ javaDoc: { methods } });
    expect(output).not.toHaveProperty('page');
    expect(output).not.toHaveProperty('format');
  });

  it('returns oversized class and member documentation without chunking', async () => {
    const text = '\u6F22\u{1F680}'.repeat(20000);
    mcaService.getMcaBaseTypeJavadoc.mockResolvedValue(`
      <section class="class-description"><div class="type-signature">public class Example</div><div class="block">${text}</div></section>
      <section class="method-details"><section class="detail"><h3>run</h3><div class="member-signature">void run()</div><div class="block">${text}</div></section></section>
    `);
    const { output } = await action().invoke();
    expect(Buffer.byteLength(JSON.stringify(output))).toBeGreaterThan(
      MAX_RESPONSE_BYTES,
    );
    expect(output).toMatchObject({
      javaDoc: {
        description: text,
        methods: [
          { name: 'run', signature: 'void run()', description: text, tags: [] },
        ],
      },
    });
    expect(output).not.toHaveProperty('format');
    expect(output).not.toHaveProperty('nextOffset');
  });

  it('rejects a missing basetype', async () => {
    mcaService.getMcaBaseType.mockResolvedValue(undefined);
    await expect(action().invoke()).rejects.toBeInstanceOf(NotFoundError);
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
