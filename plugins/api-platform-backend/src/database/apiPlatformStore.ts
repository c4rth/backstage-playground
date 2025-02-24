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
 
  getServiceInformation(service: string, version: string, containerVersion: string): Promise<ServiceInformation | undefined>;
 
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
 
  async storeServiceInformation(serviceInformation: ServiceInformation): Promise<void> {
    this.logger.info(`Add service ${serviceInformation}`);
    await this.db('services').insert({
      applicationCode: serviceInformation.applicationCode,
      service: serviceInformation.serviceName,
      version: serviceInformation.serviceVersion,
      containerVersion: serviceInformation.containerVersion,
      containerName: serviceInformation.containerName,
      repository: serviceInformation.repository,
      sonarQubeProjectKey: serviceInformation.sonarQubeProjectKey,
      consumedApis: JSON.stringify(serviceInformation.apiDependencies.consumedApis || []),
      providedApis: JSON.stringify(serviceInformation.apiDependencies.providedApis || []),
    });
  }
 
  async getServiceInformation(service: string, version: string, containerVersion: string): Promise<ServiceInformation | undefined> {
    this.logger.info(`Fetch service ${service}-${version}-${containerVersion}`);
    const result = await this.db<DbServicesRow>('services')
      .select('*')
      .where({ service: service, version: version, containerVersion: containerVersion })
      .first();
    this.logger.info(`Result: ${JSON.stringify(result)}`);
    if (result) {
      const info: ServiceInformation = {
        applicationCode: result.applicationCode,
        serviceName: service,
        serviceVersion: version,
        containerName: result.containerName,
        containerVersion: containerVersion,
        repository: result.repository,
        sonarQubeProjectKey: result.sonarQubeProjectKey,
        apiDependencies: {
          consumedApis: result.consumedApis ? JSON.parse(result.consumedApis) : undefined,
          providedApis: result.providedApis ? JSON.parse(result.providedApis) : undefined,
        }
      };
      return info;
    }
    return undefined;
  }
}