import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { z } from 'zod/v3';
import { mockServices } from '@backstage/backend-test-utils';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_VERSION,
  ANNOTATION_SERVICE_IMAGE_VERSION,
  ANNOTATION_SERVICE_NAME,
  ANNOTATION_SERVICE_PLATFORM,
  ANNOTATION_SERVICE_VERSION,
  ApiRelationsDefinition,
  ApiVersionDefinition,
  ServiceDefinition,
  ServiceRelationsDefinition,
} from '@internal/plugin-api-platform-common';
import { ApiService } from '../services/ApiService';
import { ApiServiceImpl } from '../services/ApiService/ApiServiceImpl';
import { NotFoundError } from '@backstage/errors';
import { ServiceService } from '../services/ServiceService';
import { SystemService } from '../services/SystemService';
import { registerMcpActions } from './index';

const MAX_RESPONSE_BYTES = 32768;

describe('compact API Platform MCP responses', () => {
  const actionsRegistry: ActionsRegistryService = { register: jest.fn() };
  const register = jest.mocked(actionsRegistry.register);
  const logger = mockServices.logger.mock();
  const auth = mockServices.auth.mock();
  const catalog: jest.Mocked<CatalogService> = {
    getEntities: jest.fn(),
    getEntitiesByRefs: jest.fn(),
    queryEntities: jest.fn(),
    getEntityAncestors: jest.fn(),
    getEntityByRef: jest.fn(),
    removeEntityByUid: jest.fn(),
    refreshEntity: jest.fn(),
    getEntityFacets: jest.fn(),
    getLocations: jest.fn(),
    queryLocations: jest.fn(),
    streamLocations: jest.fn(),
    getLocationById: jest.fn(),
    getLocationByRef: jest.fn(),
    addLocation: jest.fn(),
    removeLocationById: jest.fn(),
    updateLocation: jest.fn(),
    getLocationByEntity: jest.fn(),
    validateEntity: jest.fn(),
    analyzeLocation: jest.fn(),
    streamEntities: jest.fn(),
  };
  const apiService: jest.Mocked<ApiService> = {
    getApisCount: jest.fn(),
    listApis: jest.fn(),
    getApiVersions: jest.fn(),
    getApiMatchingVersion: jest.fn(),
    getApiRelations: jest.fn(),
  };
  const serviceService: jest.Mocked<ServiceService> = {
    getServicesCount: jest.fn(),
    listServices: jest.fn(),
    getServiceVersions: jest.fn(),
    getServiceRelations: jest.fn(),
  };
  const systemService: jest.Mocked<SystemService> = {
    getSystemsCount: jest.fn(),
    listSystems: jest.fn(),
    getSystem: jest.fn(),
  };
  const longText = '\u6F22\u{1F680}"'.repeat(20000);
  const ids = Array.from({ length: 237 }, (_, i) => String(i).padStart(3, '0'));
  const versions: ApiVersionDefinition[] = ids.map(id => ({
    name: 'Example',
    system: 'demo',
    namespace: 'default',
    entityRef: `api:default/example-${id}`,
    version: `1.0.${id}`,
    project: 'project',
  }));
  const service: ServiceDefinition = {
    name: 'demo-example',
    serviceName: 'example',
    system: 'demo',
    owner: 'team',
    versions: ids.map(id => ({
      version: id,
      environments: {
        tst: {
          imageVersion: id,
          entityRef: `component:default/example-${id}`,
          platform: 'platform',
          dependencies: [`component:default/dependency-${id}`],
        },
      },
    })),
  };
  const apiRelations: ApiRelationsDefinition[] = [
    {
      ...versions[0],
      apiVersion: versions[0].version,
      services: ids.map(id => ({
        service: {
          name: `service-${id}`,
          system: 'demo',
          namespace: 'default',
          entityRef: `component:default/service-${id}`,
          owner: 'team',
          environment: 'tst',
          version: id,
          imageVersion: id,
          platform: 'platform',
        },
        version: id,
        lifecycle: 'production',
      })),
    },
  ];
  const serviceRelations: ServiceRelationsDefinition[] = ids.map(id => ({
    name: 'example',
    system: 'demo',
    namespace: 'default',
    entityRef: `component:default/example-${id}`,
    owner: 'team',
    environment: 'tst',
    version: id,
    imageVersion: id,
    platform: 'platform',
    apis: { consumed: [{ ...versions[0], owner: 'project' }], provided: [] },
  }));
  const systemEntity: Entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'System',
    metadata: {
      name: 'demo',
      namespace: 'default',
      annotations: { documentation: longText },
    },
    spec: { owner: 'team' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const options = {
      actionsRegistry,
      logger,
      auth,
      catalog,
      apiService,
      serviceService,
      systemService,
    };
    registerMcpActions(options);
    apiService.getApiVersions.mockResolvedValue(versions);
    apiService.getApiMatchingVersion.mockResolvedValue(versions[0]);
    apiService.getApiRelations.mockImplementation(async request =>
      request.relationType === 'consumer' ? apiRelations : [],
    );
    apiService.listApis.mockResolvedValue({
      items: [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'API',
          metadata: {
            name: 'example',
            namespace: 'default',
            description: longText,
          },
          spec: { system: 'demo' },
        },
      ],
      offset: 0,
      limit: 20,
      totalCount: 1,
      hasMore: false,
    });
    serviceService.listServices.mockResolvedValue({
      items: [service],
      offset: 0,
      limit: 20,
      totalCount: 1,
      hasMore: false,
    });
    serviceService.getServiceVersions.mockResolvedValue(service);
    serviceService.getServiceRelations.mockResolvedValue(serviceRelations);
    systemService.listSystems.mockResolvedValue({
      items: [systemEntity],
      offset: 0,
      limit: 20,
      totalCount: 1,
      hasMore: false,
    });
    systemService.getSystem.mockResolvedValue({
      entity: systemEntity,
      apis: ids,
      services: ids,
      libraries: ids,
    });
    catalog.getEntities.mockResolvedValue({
      items: ids.map(id => ({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'User',
        metadata: {
          name: `user-${id}`,
          namespace: 'default',
          annotations: { documentation: longText },
        },
        spec: { memberOf: ['team'], profile: { displayName: `User ${id}` } },
      })),
    });
  });

  it('batch-resolves and deduplicates service refs in API relations', async () => {
    const apiEntity = (name: string): Entity => ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'API',
      metadata: {
        name,
        namespace: 'default',
        annotations: {
          [ANNOTATION_API_NAME]: 'Example',
          [ANNOTATION_API_VERSION]: '1.0.0',
        },
      },
      spec: { system: 'demo' },
      relations: [
        {
          type: 'apiConsumedBy',
          targetRef: 'component:default/example-service',
        },
      ],
    });
    const serviceEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'example-service',
        namespace: 'default',
        annotations: {
          [ANNOTATION_SERVICE_NAME]: 'ExampleService',
          [ANNOTATION_SERVICE_VERSION]: '2.0.0',
          [ANNOTATION_SERVICE_IMAGE_VERSION]: 'image-2',
          [ANNOTATION_SERVICE_PLATFORM]: 'platform',
        },
      },
      spec: {
        system: 'demo',
        owner: 'team',
        lifecycle: 'production',
      },
    };
    catalog.getEntities.mockResolvedValue({
      items: [apiEntity('example-1'), apiEntity('example-2')],
    });
    catalog.getEntitiesByRefs.mockResolvedValue({ items: [serviceEntity] });

    const service = new ApiServiceImpl({ logger, catalog, auth });
    const relations = await service.getApiRelations({
      apiName: 'Example',
      relationType: 'consumer',
    });

    expect(catalog.getEntitiesByRefs).toHaveBeenCalledTimes(1);
    expect(catalog.getEntitiesByRefs).toHaveBeenCalledWith(
      expect.objectContaining({
        entityRefs: ['component:default/example-service'],
      }),
      expect.objectContaining({
        credentials: await auth.getOwnServiceCredentials(),
      }),
    );
    expect(catalog.getEntityByRef).not.toHaveBeenCalled();
    expect(relations).toHaveLength(2);
    expect(relations[0].services[0]).toMatchObject({
      service: {
        name: 'ExampleService',
        system: 'demo',
        namespace: 'default',
        entityRef: 'component:default/example-service',
        owner: 'team',
        environment: 'production',
        version: '2.0.0',
        imageVersion: 'image-2',
        platform: 'platform',
      },
      version: '1.0.0',
      lifecycle: 'apiConsumedBy',
    });
  });

  async function invoke(
    name: string,
    input: Record<string, string | number | boolean> = {},
  ) {
    const action = register.mock.calls
      .map(([a]) => a)
      .find(a => a.name === name);
    if (!action) throw new Error(`Missing action ${name}`);
    const result = await action.action({
      input,
      logger,
      secrets: undefined,
      credentials: {
        $$type: '@backstage/BackstageCredentials',
        principal: { type: 'none' },
      },
    });
    expect(action.schema.output(z).parse(result.output)).toEqual(result.output);
    expect(result.output).not.toHaveProperty('format');
    return result.output;
  }

  it.each(['API', 'Component', 'System', 'User'])(
    'retrieves complete %s entities by reference using service credentials',
    async kind => {
      const entity = { ...systemEntity, kind };
      catalog.getEntityByRef.mockResolvedValue(entity);
      const entityRef = `${kind.toLowerCase()}:default/demo`;
      const output = await invoke('get-entity-by-ref', {
        entityRef: ` ${kind}:Default/Demo `,
      });
      expect(output).toEqual({ entityRef, entity });
      expect(catalog.getEntityByRef).toHaveBeenLastCalledWith(entityRef, {
        credentials: await auth.getOwnServiceCredentials(),
      });
    },
  );

  it.each(['API', 'api', 'ApiDefinition'])(
    'parses OpenAPI YAML definitions for kind %s without mutating the catalog entity',
    async kind => {
      const definition =
        'openapi: 3.0.3\ninfo:\n  title: Example\n  version: 1.0.0\npaths: {}\n';
      const entity: Entity = {
        ...systemEntity,
        kind,
        spec: { type: 'openapi', owner: 'team', definition },
      };
      catalog.getEntityByRef.mockResolvedValue(entity);
      expect(
        await invoke('get-entity-by-ref', {
          entityRef: `${kind}:default/demo`,
        }),
      ).toEqual({
        entityRef: `${kind.toLowerCase()}:default/demo`,
        entity: {
          ...entity,
          spec: {
            ...entity.spec,
            definition: {
              openapi: '3.0.3',
              info: { title: 'Example', version: '1.0.0' },
              paths: {},
            },
          },
        },
      });
      expect(entity.spec?.definition).toBe(definition);
      expect(logger.warn).not.toHaveBeenCalled();
    },
  );

  it('parses JSON OpenAPI definitions', async () => {
    const definition = { openapi: '3.1.0', paths: {} };
    const entity: Entity = {
      ...systemEntity,
      kind: 'API',
      spec: { type: 'openapi', definition: JSON.stringify(definition) },
    };
    catalog.getEntityByRef.mockResolvedValue(entity);
    expect(
      await invoke('get-entity-by-ref', { entityRef: 'api:default/demo' }),
    ).toEqual({
      entityRef: 'api:default/demo',
      entity: { ...entity, spec: { ...entity.spec, definition } },
    });
  });

  it.each(['openapi: [', '', 'null', 'scalar', '- item'])(
    'preserves an invalid or non-object OpenAPI definition %j and logs a warning',
    async definition => {
      const entity: Entity = {
        ...systemEntity,
        kind: 'API',
        spec: { type: 'openapi', definition },
      };
      catalog.getEntityByRef.mockResolvedValue(entity);
      expect(
        await invoke('get-entity-by-ref', { entityRef: 'api:default/demo' }),
      ).toEqual({ entityRef: 'api:default/demo', entity });
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('preserving original YAML'),
        expect.any(Error),
      );
    },
  );

  it.each([
    { kind: 'Component', spec: { type: 'openapi', definition: 'paths: {}' } },
    { kind: 'API', spec: { type: 'asyncapi', definition: 'channels: {}' } },
    { kind: 'API', spec: { type: 'graphql', definition: 'type Query {}' } },
    { kind: 'API', spec: { type: 'openapi', definition: { paths: {} } } },
    { kind: 'API', spec: { type: 'openapi' } },
    { kind: 'API' },
  ])('preserves definitions outside string OpenAPI APIs: %j', async fields => {
    const entity: Entity = { ...systemEntity, ...fields };
    catalog.getEntityByRef.mockResolvedValue(entity);
    const entityRef = `${entity.kind.toLowerCase()}:default/demo`;
    expect(await invoke('get-entity-by-ref', { entityRef })).toEqual({
      entityRef,
      entity,
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it.each([
    '',
    ' ',
    'demo',
    'api:demo',
    'default/demo',
    'api:/demo',
    'api:default/demo/extra',
  ])(
    'rejects incomplete or invalid entityRef=%j before querying the catalog',
    async entityRef => {
      await expect(invoke('get-entity-by-ref', { entityRef })).rejects.toThrow(
        'entityRef must use kind:namespace/name format',
      );
      expect(catalog.getEntityByRef).not.toHaveBeenCalled();
    },
  );

  it('reports missing entities and propagates catalog failures', async () => {
    catalog.getEntityByRef.mockResolvedValue(undefined);
    await expect(
      invoke('get-entity-by-ref', {
        entityRef: 'api:default/missing',
      }),
    ).rejects.toThrow('Entity api:default/missing not found');
    catalog.getEntityByRef.mockRejectedValueOnce(
      new Error('Catalog unavailable'),
    );
    await expect(
      invoke('get-entity-by-ref', {
        entityRef: 'api:default/example',
      }),
    ).rejects.toThrow('Catalog unavailable');
  });

  it('keeps summary responses compact without advertising chunk continuation', async () => {
    const inputs = [
      ['get-api-by-name-and-version', { name: 'Example', version: '1.0.0' }],
      ['get-api-dependencies', { name: 'Example', version: '1.0.0' }],
      ['get-services', {}],
      ['get-service-versions', { name: 'example', system: 'demo' }],
      ['get-service-dependencies', { name: 'example', system: 'demo' }],
      ['get-systems', {}],
      ['get-system-by-name', { name: 'demo' }],
      ['get-members-of-system-by-name', { name: 'demo' }],
    ] as const;
    for (const [name, input] of inputs) {
      const output = await invoke(name, input);
      expect(output).not.toHaveProperty('format');
      expect(JSON.stringify(output)).not.toContain(longText);
      expect(
        register.mock.calls.find(([a]) => a.name === name)?.[0].description,
      ).not.toContain('contentOffset');
    }
    expect(await invoke('get-services')).toMatchObject({
      services: {
        items: [{ name: 'example', system: 'demo', versionCount: 237 }],
      },
    });
    expect(await invoke('get-system-by-name', { name: 'demo' })).toMatchObject({
      system: { counts: { apis: 237, services: 237, libraries: 237 } },
    });
    expect(
      await invoke('get-api-dependencies', {
        name: 'Example',
        version: '1.0.0',
      }),
    ).toMatchObject({
      summary: { consumerCount: 237, providerCount: 0 },
    });
  });

  it.each([
    [
      'get-api-dependencies',
      { name: 'Example', version: '1.0.0', details: true },
      'relations',
    ],
    ['get-service-versions', { name: 'example', system: 'demo' }, 'page'],
    [
      'get-service-versions',
      { name: 'example', system: 'demo', section: 'environments' },
      'page',
    ],
    [
      'get-service-versions',
      { name: 'example', system: 'demo', section: 'dependencies' },
      'page',
    ],
    [
      'get-service-dependencies',
      { name: 'example', system: 'demo', details: true },
      'relations',
    ],
    ['get-system-by-name', { name: 'demo', section: 'apis' }, 'page'],
    ['get-members-of-system-by-name', { name: 'demo' }, 'members'],
  ])(
    'traverses %s %j without gaps or duplicates',
    async (name, input, pageKey) => {
      const items: unknown[] = [];
      let offset = 0;
      for (;;) {
        const output = await invoke(name, { ...input, offset, limit: 100 });
        const page = output[pageKey] as {
          items: unknown[];
          totalCount: number;
          hasMore: boolean;
          nextOffset: number | null;
        };
        expect(page.totalCount).toBe(237);
        expect(page.nextOffset === null).toBe(!page.hasMore);
        items.push(...page.items);
        if (!page.hasMore) {
          break;
        }
        if (page.nextOffset === null)
          throw new Error('Missing page continuation');
        offset = page.nextOffset;
      }
      expect(items).toHaveLength(237);
      expect(new Set(items.map(item => JSON.stringify(item))).size).toBe(237);
      const identities = items.map(item => {
        const entry = item as {
          version?: string;
          name?: string;
          service?: { name: string; version: string };
        };
        if (name === 'get-api-dependencies')
          return entry.service?.name.replace(/^service-/, '');
        if (name === 'get-service-dependencies') return entry.service?.version;
        if (name === 'get-members-of-system-by-name')
          return entry.name?.replace(/^user-/, '');
        if (name === 'get-system-by-name') return entry.name;
        return entry.version;
      });
      expect(identities.sort()).toEqual(ids);
      expect(
        (await invoke(name, { ...input, offset: 237 }))[pageKey],
      ).toMatchObject({
        items: [],
        hasMore: false,
        nextOffset: null,
      });
    },
  );

  it.each([
    ['get-apis', 'apis'],
    ['get-services', 'services'],
    ['get-systems', 'systems'],
  ])(
    'preserves fetched pages and continuation for %s',
    async (name, pageKey) => {
      for (const [offset, totalCount, empty] of [
        [20, 26, false],
        [20, 21, false],
        [26, 26, true],
      ] as const) {
        const metadata = { offset, limit: 5, totalCount, hasMore: false };
        apiService.listApis.mockResolvedValue({
          ...metadata,
          items: empty ? [] : [systemEntity],
        });
        serviceService.listServices.mockResolvedValue({
          ...metadata,
          items: empty ? [] : [service],
        });
        systemService.listSystems.mockResolvedValue({
          ...metadata,
          items: empty ? [] : [systemEntity],
        });
        const output = await invoke(name, {
          apiType: 'all',
          offset,
          limit: 5,
        });
        expect(output[pageKey]).toEqual({
          offset,
          limit: 5,
          totalCount,
          items: empty ? [] : [expect.any(Object)],
          hasMore: totalCount === 26 && offset === 20,
          nextOffset: totalCount === 26 && offset === 20 ? 21 : null,
        });
      }
    },
  );

  it('returns all API versions without pagination or chunking', async () => {
    const largeVersions = versions.map(version => ({
      ...version,
      project: longText,
    }));
    apiService.getApiVersions.mockResolvedValue(largeVersions);
    const output = await invoke('get-api-versions-by-name', {
      name: 'Example',
      system: 'demo',
    });
    expect(output).toEqual({ apis: largeVersions });
    expect(Buffer.byteLength(JSON.stringify(output))).toBeGreaterThan(
      MAX_RESPONSE_BYTES,
    );
    expect(output).not.toHaveProperty('format');
    expect(apiService.getApiVersions).toHaveBeenLastCalledWith({
      apiName: 'Example',
      system: 'demo',
    });
    apiService.getApiVersions.mockResolvedValue([]);
    expect(
      await invoke('get-api-versions-by-name', { name: 'Missing' }),
    ).toEqual({ apis: [] });
    expect(apiService.getApiVersions).toHaveBeenLastCalledWith({
      apiName: 'Missing',
      system: undefined,
    });
  });

  it('returns opt-in raw entities and long descriptions directly without chunking', async () => {
    expect(
      await invoke('get-system-by-name', { name: 'demo', section: 'entity' }),
    ).toMatchObject({
      entity: systemEntity,
    });
    expect(
      await invoke('get-members-of-system-by-name', {
        name: 'demo',
        details: true,
        limit: 1,
      }),
    ).toMatchObject({
      members: {
        items: [
          {
            entity: { metadata: { annotations: { documentation: longText } } },
          },
        ],
        nextOffset: 1,
      },
    });
    expect(await invoke('get-apis', { apiType: 'all' })).toMatchObject({
      apis: { items: [{ description: longText }] },
    });
  });

  it('returns complete API fields without chunking and preserves pagination/filter inputs', async () => {
    const input = {
      apiType: 'all',
      offset: 20,
      limit: 5,
      search: 'example',
      orderBy: { field: 'name', direction: 'ascending' },
    } as const;
    apiService.listApis.mockResolvedValue({
      items: [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'API',
          metadata: {
            name: 'example',
            namespace: 'default',
            description: longText,
          },
          spec: { system: 'demo', owner: 'team' },
        },
      ],
      offset: 20,
      limit: 5,
      totalCount: 26,
      hasMore: true,
    });
    const registered = register.mock.calls
      .map(([a]) => a)
      .find(a => a.name === 'get-apis');
    if (!registered) throw new Error('Missing get-apis');
    const { output } = await registered.action({
      input,
      logger,
      secrets: undefined,
      credentials: {
        $$type: '@backstage/BackstageCredentials',
        principal: { type: 'none' },
      },
    });
    expect(output).toEqual({
      apis: {
        items: [
          {
            name: 'example',
            system: 'demo',
            namespace: 'default',
            entityRef: 'api:default/example',
            version: '',
            type: '',
            project: '',
            description: longText,
            owner: 'team',
          },
        ],
        offset: 20,
        limit: 5,
        totalCount: 26,
        hasMore: true,
        nextOffset: 21,
      },
    });
    expect(Buffer.byteLength(JSON.stringify(output))).toBeGreaterThan(
      MAX_RESPONSE_BYTES,
    );
    expect(output).not.toHaveProperty('format');
    expect(apiService.listApis).toHaveBeenLastCalledWith({
      ...input,
      ownershipType: 'all',
    });
    expect(registered.description).not.toContain('contentOffset');
    expect(registered.description).not.toContain('details=true');
  });

  it('applies exact version/environment/direction selectors and preserves API inputs', async () => {
    expect(
      await invoke('get-service-versions', {
        name: 'example',
        system: 'demo',
        section: 'environments',
        version: '017',
        environment: 'tst',
      }),
    ).toMatchObject({
      page: {
        totalCount: 1,
        items: [{ version: '017', imageVersion: '017', namespace: 'default' }],
      },
    });
    expect(
      await invoke('get-service-dependencies', {
        name: 'example',
        system: 'demo',
        version: '017',
        environment: 'tst',
        imageVersion: '017',
        details: true,
      }),
    ).toMatchObject({
      relations: {
        totalCount: 1,
        items: [{ direction: 'consumed', api: versions[0] }],
      },
    });
    expect(serviceService.getServiceRelations).toHaveBeenLastCalledWith({
      system: 'demo',
      serviceName: 'example',
      imageVersion: '017',
    });
    expect(
      await invoke('get-api-dependencies', {
        name: 'Example',
        version: versions[0].version,
        direction: 'provider',
        details: true,
      }),
    ).toMatchObject({
      relations: { items: [], totalCount: 0, hasMore: false },
    });
    expect(apiService.getApiRelations).toHaveBeenCalledWith({
      system: undefined,
      apiName: 'Example',
      apiVersion: versions[0].version,
      relationType: 'consumer',
    });
    expect(
      await invoke('get-service-dependencies', {
        name: 'example',
        system: 'demo',
        direction: 'provided',
        details: true,
      }),
    ).toMatchObject({
      relations: { items: [], totalCount: 0, hasMore: false },
    });
  });

  it('reports an unmatched API version as not found', async () => {
    apiService.getApiMatchingVersion.mockResolvedValue(undefined);
    const action = register.mock.calls
      .map(([registered]) => registered)
      .find(registered => registered.name === 'get-api-by-name-and-version');
    if (!action) throw new Error('Missing API version action');

    await expect(
      action.action({
        input: { name: 'Missing', version: '1.0.0' },
        logger,
        secrets: undefined,
        credentials: {
          $$type: '@backstage/BackstageCredentials',
          principal: { type: 'none' },
        },
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
