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
import { McaComponent } from '@internal/plugin-mca-common';

export type IndexableMcaComponentDocument = IndexableDocument & {
  applicationCode: string;
  shortName: string;
  prdVersion: string;
  otherVersions: string[];
  kind: string;
};

export type McaComponentsCollatorOptions = {
  logger: LoggerService;
  discoveryApi: DiscoveryService;
  auth: AuthService;
  limit: number;
};

export class McaComponentsCollatorFactory implements DocumentCollatorFactory {
  public readonly type: string = 'mca-components';
  private readonly discoveryApi: DiscoveryService;
  private readonly logger: LoggerService;
  private readonly auth: AuthService;
  private readonly limit: number;

  private constructor(options: McaComponentsCollatorOptions) {
    this.discoveryApi = options.discoveryApi;
    this.logger = options.logger;
    this.auth = options.auth;
    this.limit = options.limit;
  }

  static fromConfig(options: McaComponentsCollatorOptions) {
    return new McaComponentsCollatorFactory(options);
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  private async *execute(): AsyncGenerator<IndexableMcaComponentDocument> {
    this.logger.debug('Indexing mca components');

    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'mca',
    });

    const baseUrl = await this.discoveryApi.getBaseUrl('mca');

    const countUrl = new URL(`${baseUrl}/mca/count?type=all`);
    const responseCount = await fetch(countUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dataCount = (await responseCount.json()) as number;
    this.logger.debug(`mca/count: ${dataCount} - limit: ${this.limit}`);

    for (let offset = 0; offset < dataCount; offset += this.limit) {
      const query = new URLSearchParams({
        offset: String(offset),
        limit: String(this.limit),
        type: 'all',
      });
      const url = new URL(`${baseUrl}/mca/components?${query}`);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { items = [] } = await response.json();
      for (const item of items) {
        yield this.getDocumentInfo(item);
      }
    }
  }

  private getDocumentInfo(
    mcaComponent: McaComponent,
  ): IndexableMcaComponentDocument {
    return {
      title: mcaComponent.component,
      text: `package: dexia.opmk.operation.${mcaComponent.packageName}`,
      shortName: mcaComponent.component
        .replace(/^(Operation)/, '')
        .replace(/^(Element)/, ''),
      applicationCode: mcaComponent.applicationCode,
      prdVersion: mcaComponent.prdVersion,
      otherVersions: [
        mcaComponent.p1Version,
        mcaComponent.p2Version,
        mcaComponent.p3Version,
        mcaComponent.p4Version,
      ].filter(x => x) as string[],
      location: `/mca/components/${mcaComponent.component}`,
      kind: 'MCA Component',
    };
  }
}
