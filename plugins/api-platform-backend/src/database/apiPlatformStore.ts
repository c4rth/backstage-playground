import {
  DatabaseService,
  LoggerService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { ServiceApisDefinition } from '@internal/plugin-api-platform-common';

import { Knex } from 'knex';

export interface ApiPlatformStore {

  storeServiceApis(service: string, version: string, containerVersion: string, consumedApis?: string, providedApis?: string): Promise<void>;

  getServiceApis(service: string, version: string, containerVersion: string): Promise<ServiceApisDefinition>;

}

const migrationsDir = resolvePackagePath(
  '@internal/plugin-api-platform-backend', // Package name
  'migrations', // Migrations directory
);


export class DatabaseApiPlatformStore implements ApiPlatformStore {
  private constructor(
    private readonly db: Knex,
    private readonly logger: LoggerService,
  ) { }

  static async create({
    database,
    skipMigrations,
    logger,
  }: {
    database: DatabaseService;
    skipMigrations: boolean;
    logger: LoggerService;
  }): Promise<ApiPlatformStore> {
    logger.info("Init API platform database");
    const client = await database.getClient();

    if (!database.migrations?.skip && !skipMigrations) {
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }
    return new DatabaseApiPlatformStore(client, logger);
  }

  async storeServiceApis(service: string, version: string, containerVersion: string, consumedApis?: string, providedApis?: string): Promise<void> {
    this.logger.info(`Add service ${service}-${version}-${containerVersion}: ${consumedApis} ${providedApis}`);
    await this.db('services').insert({
      service: service,
      version: version,
      containerVersion: containerVersion,
      consumedApis: consumedApis,
      providedApis: providedApis,
    });
  }

  async getServiceApis(service: string, version: string, containerVersion: string): Promise<ServiceApisDefinition> {
    this.logger.info(`Fetch service ${service}-${version}-${containerVersion}`);
    const result = await this.db('services')
      .select('*')
      .where({ service: service, version: version, containerVersion: containerVersion })
      .first();
    this.logger.info(`Result: ${JSON.stringify(result)}`);
    const def: ServiceApisDefinition = {
      consumedApis: [
        'x',
        'y'
      ],
      providedApis: [
        'x',
        'y'
      ],
    }
    return def;
  }
}