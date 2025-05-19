import { Readable } from 'stream';
import {
  DocumentCollatorFactory,
  IndexableDocument,
} from '@backstage/plugin-search-common';
import {
  AuthService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { McaBaseType } from '@internal/plugin-mca-common';

export type IndexableMcaBaseTypeDocument = IndexableDocument;

export type McaBaseTypesCollatorOptions = {
  logger: LoggerService;
  discoveryApi: DiscoveryService;
  auth: AuthService;
  limit: number;
};

export class McaBaseTypesCollatorFactory implements DocumentCollatorFactory {
  public readonly type: string = 'mca-basetypes';
  private readonly discoveryApi: DiscoveryService;
  private readonly logger: LoggerService;
  private readonly auth: AuthService;
  private readonly limit: number;

  private constructor(options: McaBaseTypesCollatorOptions) {
    this.discoveryApi = options.discoveryApi;
    this.logger = options.logger;
    this.auth = options.auth;
    this.limit = options.limit;
  }

  static fromConfig(options: McaBaseTypesCollatorOptions) {
    return new McaBaseTypesCollatorFactory(options);
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  private async *execute(): AsyncGenerator<IndexableMcaBaseTypeDocument> {
    this.logger.info('Indexing mca-basetypes');

    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'mca',
    });

    const baseUrl = await this.discoveryApi.getBaseUrl('mca');

    const countUrl = new URL(`${baseUrl}/basetypes/count`);
    const responseCount = await fetch(countUrl, { headers: { Authorization: `Bearer ${token}` } });
    const dataCount = await responseCount.json() as number;
    this.logger.debug(`/basetypes/count: ${JSON.stringify(dataCount)} - limit: ${this.limit}`);

    let offset = 0;
    while (offset < dataCount) {
      const query = new URLSearchParams();
      query.set('offset', String(offset));
      query.set('limit', String(this.limit));
      const url = new URL(`${baseUrl}/basetypes/components?${query}`);
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      const items = data.items;
      for (const item of items) {
        yield this.getDocumentInfo(item);
      }
      offset += this.limit;
    }
  }

  private getDocumentInfo(mcaBaseType: McaBaseType): IndexableMcaBaseTypeDocument {
    return {
      title: mcaBaseType.baseType,
      text: `package: ${mcaBaseType.packageName}`,
      location: `/mca/basetypes/${mcaBaseType.baseType}`,
    };
  }
}