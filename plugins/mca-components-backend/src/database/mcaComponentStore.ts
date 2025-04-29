import {
  DatabaseService,
  LoggerService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { McaComponent, McaComponentListResult, McaComponentType, McaVersions } from '@internal/plugin-mca-components-common';

import { Knex } from 'knex';
import { DbMcaRow } from './tables';
import { McaComponentOrderByOptions } from '../services/McaService/types';

export interface McaComponentsStore {

  getMcaComponent(component: string): Promise<McaComponent | undefined>;
  getMcaComponents(limit: number, offset: number, type: McaComponentType, orderBy?: McaComponentOrderByOptions, search?: string,): Promise<McaComponentListResult>;
  getMcaComponentsCount(type: McaComponentType): Promise<number>;
  getMcaVersions(): Promise<McaVersions | undefined>;
}

const migrationsDir = resolvePackagePath(
  '@internal/plugin-mca-components-backend', // Package name
  'migrations', // Migrations directory
);

function mapMcaComponentOrderByField(field: string): string {
  switch (field) {
    case 'component':
      return 'component';
    case 'prdVersion':
      return 'prd_version';
    case 'p1Version':
      return 'p1_version';
    case 'p2Version':
      return 'p2_version';
    case 'p3Version':
      return 'p3_version';
    case 'p4Version':
      return 'p4_version';
    case 'applicationCode':
      return 'application_code';
    case 'packageName':
      return 'package_name';
    default:
      throw new Error(`Invalid order by field: ${field}`);
  }
}

export class DatabaseMcaComponentsStore implements McaComponentsStore {
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
  }): Promise<McaComponentsStore> {
    logger.info("Init Mca Components database");
    const client = await database.getClient();

    if (!database.migrations?.skip && !skipMigrations) {
      logger.info("Migrate mca-components database");
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }
    return new DatabaseMcaComponentsStore(client, logger);
  }

  async getMcaComponent(component: string): Promise<McaComponent | undefined> {
    this.logger.info(`Fetch mca ${component}`);
    const row = await this.db<DbMcaRow>('mca_components')
      .select('*')
      .where({ component: component })
      .first();
    if (row) {
      const mca: McaComponent = {
        component: row.component,
        prdVersion: row.prd_version,
        p1Version: row.p1_version,
        p2Version: row.p2_version,
        p3Version: row.p3_version,
        p4Version: row.p4_version,
        applicationCode: row.application_code,
        packageName: row.package_name,
      };
      return mca;
    }
    return undefined;
  }

  async getMcaComponents(offset: number, limit: number, type: McaComponentType, orderBy?: McaComponentOrderByOptions, search?: string): Promise<McaComponentListResult> {
    this.logger.info(`Fetch mca components`);

    const baseQuery = this.db<DbMcaRow>('mca_components')
      .select('*')
      .offset(offset)
      .limit(limit);

    if (type === 'element') {
      baseQuery.where('type', 'like', 'e');
    } else if (type === 'operation') {
      baseQuery.where('type', 'like', 'o');
    }

    if (search) {
      const searchQuery = [
        'component',
        'prd_version',
        'p1_version',
        'p2_version',
        'p3_version',
        'p4_version',
        'application_code',
        'package_name',
      ].map(field => `LOWER(${field}) LIKE ?`).join(' OR ');

      baseQuery.whereRaw(searchQuery, Array(8).fill(`%${search.toLowerCase()}%`));
    }

    if (orderBy) {
      baseQuery.orderBy(mapMcaComponentOrderByField(orderBy.field), orderBy.direction);
    }

    const result = await baseQuery;

    if (result) {
      const mcaComponents: McaComponent[] = result.map((row) => ({
        component: row.component,
        prdVersion: row.prd_version,
        p1Version: row.p1_version,
        p2Version: row.p2_version,
        p3Version: row.p3_version,
        p4Version: row.p4_version,
        applicationCode: row.application_code,
        packageName: row.package_name,
      }));
      return {
        items: mcaComponents,
        offset,
        limit,
      };
    }
    return {
      items: [],
      offset,
      limit,
    };;
  }

  async getMcaComponentsCount(type: McaComponentType): Promise<number> {
    this.logger.info(`Mca components count`);
    const baseQuery = this.db<DbMcaRow>('mca_components')
      .count({ count: '*' });
    if (type === 'element') {
      baseQuery.where('component', 'like', 'E%');
    } else if (type === 'operation') {
      baseQuery.where('component', 'like', 'O%');
    }
    const total = await baseQuery;
    this.logger.info(`Mca components count: ${JSON.stringify(total)}`);
    return Number(total[0].count);
  }

  async getMcaVersions(): Promise<McaVersions | undefined> {
    this.logger.info(`Fetch mca versions`);
    const row = await this.db('mca_versions')
      .select('*')
      .first();
    if (row) {
      const mcaVersions: McaVersions = {
        p1Version: row.p1_version,
        p2Version: row.p2_version,
        p3Version: row.p3_version,
        p4Version: row.p4_version,
      };
      return mcaVersions;
    }
    return undefined;
  }

}