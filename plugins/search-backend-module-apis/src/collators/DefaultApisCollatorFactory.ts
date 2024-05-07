import { Config } from '@backstage/config';
import {
  PluginEndpointDiscovery,
  TokenManager,
  createLegacyAuthAdapters,
} from '@backstage/backend-common';
import { Readable } from 'stream';
import { DocumentCollatorFactory } from '@backstage/plugin-search-common';
import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { CatalogApi, GetEntitiesRequest } from '@backstage/catalog-client';
import { catalogEntityReadPermission } from '@backstage/plugin-catalog-common/alpha';
import { Permission } from '@backstage/plugin-permission-common';
import { readCollatorConfigOptions } from './config';
import { ApisDocument, defaultApiCollatorEntityTransformer } from './ApiCollatorEntityTransformer';

export type ApisCollatorFactoryOptions = {
  auth: AuthService;
  discovery: PluginEndpointDiscovery;
  tokenManager?: TokenManager;
  catalogClient: CatalogApi;
  logger: LoggerService;
  batchSize?: number;
  locationTemplate?: string;
  filter?: GetEntitiesRequest['filter'];
};

export class DefaultApisCollatorFactory implements DocumentCollatorFactory {
  public readonly type: string = 'apis';
  private readonly logger: LoggerService;
  public readonly visibilityPermission: Permission = catalogEntityReadPermission;
  private locationTemplate: string;
  private filter?: GetEntitiesRequest['filter'];
  private batchSize?: number;
  private readonly catalogClient: CatalogApi;
  private auth: AuthService;
  private entityTransformer = defaultApiCollatorEntityTransformer;

  private constructor(options: ApisCollatorFactoryOptions) {
    this.auth = options.auth;
    this.catalogClient = options.catalogClient;
    this.logger = options.logger;
    this.batchSize = options.batchSize;
    this.locationTemplate = options.locationTemplate!!;
    this.filter = options.filter;
  }

  static fromConfig(config: Config, options: ApisCollatorFactoryOptions) {
    const configOptions = readCollatorConfigOptions(config);
    const { auth: adaptedAuth } = createLegacyAuthAdapters({
      auth: options.auth,
      discovery: options.discovery,
      tokenManager: options.tokenManager,
    });
    return new DefaultApisCollatorFactory({
      locationTemplate: options.locationTemplate ?? configOptions.locationTemplate,
      filter: options.filter ?? configOptions.filter,
      batchSize: options.batchSize ?? configOptions.batchSize,
      auth: adaptedAuth,
      discovery: options.discovery,
      catalogClient: options.catalogClient,
      logger: options.logger
    } as ApisCollatorFactoryOptions);
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  async *execute(): AsyncGenerator<ApisDocument> {
    this.logger.info('executing ApisCollator');

    let entitiesRetrieved = 0;
    let moreEntitiesToGet = true;

    // Offset/limit pagination is used on the Catalog Client in order to
    // limit (and allow some control over) memory used by the search backend
    // at index-time.
    while (moreEntitiesToGet) {
      const { token } = await this.auth.getPluginRequestToken({
        onBehalfOf: await this.auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entities = (
        await this.catalogClient.getEntities(
          {
            filter: this.filter,
            limit: this.batchSize,
            offset: entitiesRetrieved,
          },
          { token },
        )
      ).items;

      // Control looping through entity batches.
      moreEntitiesToGet = entities.length === this.batchSize;
      entitiesRetrieved += entities.length;

      for (const entity of entities) {
        yield {
          ...this.entityTransformer(entity),
          authorization: {
            resourceRef: stringifyEntityRef(entity),
          },
          location: this.applyArgsToFormat(this.locationTemplate, {
            namespace: entity.metadata.namespace || 'default',
            kind: entity.kind,
            name: entity.metadata.name,
          }),
        };
      }
    }
  }

  private applyArgsToFormat(
    format: string,
    args: Record<string, string>,
  ): string {
    let formatted = format;
    for (const [key, value] of Object.entries(args)) {
      formatted = formatted.replace(`:${key}`, value);
    }
    return formatted.toLowerCase();
  }
}

