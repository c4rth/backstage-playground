import {
  DatabaseService,
  LoggerService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { ServiceInformation } from '@internal/plugin-api-platform-common';
import { Knex } from 'knex';
import { DbServicesRow } from './tables';

export interface ApiPlatformStore {

  storeServiceInformation(serviceInformation: ServiceInformation): Promise<void>;
  getServiceInformation(system: string, service: string, version: string, imageVersion: string): Promise<ServiceInformation | undefined>;

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
      logger.info("Migrate api-platform database");
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }
    return new DatabaseApiPlatformStore(client, logger);
  }

  async storeServiceInformation(serviceInformation: ServiceInformation): Promise<void> {
    this.logger.debug(`Add service ${JSON.stringify(serviceInformation)}`);
    await this.db('services').insert({
      system: serviceInformation.system,
      service: serviceInformation.serviceName,
      version: serviceInformation.serviceVersion,
      imageVersion: serviceInformation.imageVersion,
      repository: serviceInformation.repository,
      sonarQubeProjectKey: serviceInformation.sonarQubeProjectKey,
      consumedApis: JSON.stringify(serviceInformation.apiDependencies.consumedApis ?? []),
      providedApis: JSON.stringify(serviceInformation.apiDependencies.providedApis ?? []),
    });
  }

  async getServiceInformation(
    system: string,
    service: string,
    version: string,
    imageVersion: string
  ): Promise<ServiceInformation | undefined> {
    this.logger.debug(`Fetch service ${system}-${service}-${version}-${imageVersion}`);
    const result = await this.db<DbServicesRow>('services')
      .select('*')
      .where({
        applicationCode: system,
        service,
        version,
        imageVersion,
      })
      .first();
    this.logger.debug(`Result: ${JSON.stringify(result)}`);
    if (!result) return undefined;
    return {
      system: result.applicationCode,
      serviceName: result.service,
      serviceVersion: result.version,
      imageVersion: result.imageVersion,
      repository: result.repository,
      sonarQubeProjectKey: result.sonarQubeProjectKey,
      apiDependencies: {
        consumedApis: result.consumedApis ? JSON.parse(result.consumedApis) : [],
        providedApis: result.providedApis ? JSON.parse(result.providedApis) : [],
      },
    };
  }

}