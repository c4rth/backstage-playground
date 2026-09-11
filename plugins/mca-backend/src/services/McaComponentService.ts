import {
  coreServices,
  createServiceFactory,
  createServiceRef,
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
} from '@backstage/backend-plugin-api';
import {
  McaBaseTypeListRequest,
  McaComponentListRequest,
  McaJavadocAsset,
  McaService,
} from './types';
import { McaComponentStore, mcaComponentStoreServiceRef } from '../database';
import {
  McaBaseType,
  McaBaseTypeListResult,
  McaComponent,
  McaComponentListResult,
  McaComponentType,
  McaVersions,
} from '@internal/plugin-mca-common';
import { Config } from '@backstage/config';
import { McaOperationScheduledTask, McaBaseTypeScheduledTask } from '../task';
import * as cheerio from 'cheerio';
import { InputError } from '@backstage/errors';

export interface McaServiceOptions {
  logger: LoggerService;
  mcaComponentsStore: McaComponentStore;
  scheduler: SchedulerService;
  config: Config;
}

const DEFAULT_MCA_VERSIONS: McaVersions = {
  p1Version: 'P+1',
  p2Version: 'P+2',
  p3Version: 'P+3',
  p4Version: 'P+4',
};

function getJavadocAssetContentType(path: string): string | undefined {
  const extension = path.split('.').pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    css: 'text/css',
    gif: 'image/gif',
    ico: 'image/x-icon',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    js: 'application/javascript',
    png: 'image/png',
    svg: 'image/svg+xml',
  };

  return extension ? contentTypes[extension] : undefined;
}

export class McaComponentService implements McaService {
  private readonly logger: LoggerService;
  private readonly mcaComponentsStore: McaComponentStore;
  private readonly baseTypesUrl: string;
  private readonly appBaseUrl: string;

  constructor(options: McaServiceOptions) {
    this.logger = options.logger;
    this.mcaComponentsStore = options.mcaComponentsStore;
    this.baseTypesUrl = options.config.getString(
      'mcaComponents.baseTypes.baseUrl',
    );
    this.appBaseUrl = options.config
      .getString('app.baseUrl')
      .replace(/\/$/, '');
    this.logger.info('Initializing McaService');
    this.createScheduledTask(
      options.config,
      options.logger,
      options.mcaComponentsStore,
      options.scheduler,
    );
  }

  async createScheduledTask(
    config: Config,
    logger: LoggerService,
    mcaComponentsStore: McaComponentStore,
    scheduler: SchedulerService,
  ) {
    const scheduleOperations =
      readSchedulerServiceTaskScheduleDefinitionFromConfig(
        config.getConfig('mcaComponents.operations.schedule'),
      );
    await scheduler.scheduleTask({
      ...scheduleOperations,
      id: 'update-all-operations-csv',
      fn: async () => {
        McaOperationScheduledTask.create({
          logger,
          mcaComponentsStore,
          config,
        }).runAsync();
      },
    });

    const scheduleBaseTypes =
      readSchedulerServiceTaskScheduleDefinitionFromConfig(
        config.getConfig('mcaComponents.baseTypes.schedule'),
      );
    await scheduler.scheduleTask({
      ...scheduleBaseTypes,
      id: 'update-basetypes',
      fn: async () => {
        McaBaseTypeScheduledTask.create({
          logger,
          mcaComponentsStore,
          config,
        }).runAsync();
      },
    });
  }

  async getMcaComponentsCount(request: {
    type: McaComponentType;
  }): Promise<number> {
    const count = await this.mcaComponentsStore.getMcaComponentsCount(
      request.type,
    );
    return count ?? 0;
  }

  async listMcaComponents(
    request: McaComponentListRequest,
  ): Promise<McaComponentListResult> {
    const offset = request.offset ?? 0;
    const limit = request.limit ?? 20;
    return await this.mcaComponentsStore.getMcaComponents(
      offset,
      limit,
      request.type,
      request.orderBy,
      request.search,
    );
  }

  async getMcaComponent(request: {
    component: string;
  }): Promise<McaComponent | undefined> {
    return this.mcaComponentsStore.getMcaComponent(request.component);
  }

  async getMcaVersions(): Promise<McaVersions> {
    const versions = await this.mcaComponentsStore.getMcaVersions();
    return versions ?? DEFAULT_MCA_VERSIONS;
  }

  async listMcaBaseTypes(
    request: McaBaseTypeListRequest,
  ): Promise<McaBaseTypeListResult> {
    const offset = request.offset ?? 0;
    const limit = request.limit ?? 20;
    return this.mcaComponentsStore.getMcaBaseTypes(
      offset,
      limit,
      request.orderBy,
      request.search,
    );
  }

  async getMcaBaseTypesCount(): Promise<number> {
    return (await this.mcaComponentsStore.getMcaBaseTypesCount()) ?? 0;
  }

  async getMcaBaseType(request: {
    baseType: string;
  }): Promise<McaBaseType | undefined> {
    return this.mcaComponentsStore.getMcaBaseType(request.baseType);
  }

  async getMcaBaseTypeJavadoc(request: {
    baseType: string;
    packageName: string;
  }): Promise<string> {
    if (
      !/^[\w.]+$/.test(request.packageName) ||
      !/^[\w$]+$/.test(request.baseType)
    ) {
      throw new InputError('Invalid Javadoc path');
    }

    const sourceUrl = new URL(
      `${request.packageName.replace(/\./g, '/')}/${request.baseType}.html`,
      `${this.baseTypesUrl}/`,
    );
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch Javadoc: ${response.statusText}`);
    }

    const $ = cheerio.load(await response.text());
    $('.skipNav, .topNav, .navList, .subNav, .bottomNav').remove();
    $('a[href]').each((_index, element) => {
      const href = $(element).attr('href');
      if (!href) return;

      const linkUrl = new URL(href, sourceUrl);
      const match = linkUrl.pathname.match(
        /\/(?:javadoc|basetypes)\/dexia\/opmk\/basetypes\/.+\/(?:([^/]+)\.html|(dexia\.opmk\.basetypes(?:\.[\w$]+)+))$/,
      );
      const linkedBaseType = match?.[1] ?? match?.[2]?.split('.').pop();
      if (!linkedBaseType) return;

      $(element).attr(
        'href',
        `${this.appBaseUrl}/mca/basetypes/${encodeURIComponent(linkedBaseType)}`,
      );
      $(element).attr('data-mca-basetype', linkedBaseType);
    });
    $('body').append(`
      <script>
        document.addEventListener('click', function (event) {
          var link = event.target.closest('a[data-mca-basetype]');
          if (!link) return;
          event.preventDefault();
          parent.postMessage(
            { type: 'mca-basetype-navigation', baseType: link.dataset.mcaBasetype },
            ${JSON.stringify(this.appBaseUrl)},
          );
        });
      </script>
    `);
    $('link[href], script[src], img[src]').each((_index, element) => {
      const attribute = element.tagName === 'link' ? 'href' : 'src';
      const assetUrl = $(element).attr(attribute);
      if (!assetUrl) return;

      const resolvedUrl = new URL(assetUrl, sourceUrl);
      if (!resolvedUrl.href.startsWith(`${this.baseTypesUrl}/`)) return;

      $(element).attr(
        attribute,
        `/api/mca/basetypes/javadoc/assets?path=${encodeURIComponent(
          resolvedUrl.href.slice(`${this.baseTypesUrl}/`.length),
        )}`,
      );
    });

    return $.html();
  }

  async getMcaBaseTypeJavadocAsset(request: {
    path: string;
  }): Promise<McaJavadocAsset> {
    if (request.path.startsWith('/') || request.path.includes('..')) {
      throw new InputError('Invalid Javadoc asset path');
    }

    const sourceUrl = new URL(request.path, `${this.baseTypesUrl}/`);
    if (!sourceUrl.href.startsWith(`${this.baseTypesUrl}/`)) {
      throw new InputError('Invalid Javadoc asset path');
    }

    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch Javadoc asset: ${response.statusText}`);
    }

    return {
      content: Buffer.from(await response.arrayBuffer()),
      contentType:
        getJavadocAssetContentType(request.path) ??
        response.headers.get('content-type') ??
        undefined,
    };
  }

  async getLastModifiedDate(): Promise<Date | undefined> {
    return this.mcaComponentsStore.getLastModifiedDate();
  }
}

export const mcaComponentServiceRef = createServiceRef<McaService>({
  id: 'mca.component.service',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        logger: coreServices.logger,
        mcaComponentsStore: mcaComponentStoreServiceRef,
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
      },
      async factory({ logger, mcaComponentsStore, config, scheduler }) {
        const mcaComponentService = new McaComponentService({
          logger,
          mcaComponentsStore,
          config,
          scheduler,
        });
        return mcaComponentService;
      },
    }),
});
