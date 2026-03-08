import {
  DatabaseService,
  LoggerService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { McaBaseType, McaBaseTypeListResult, McaComponent, McaComponentListResult, McaComponentType, McaVersions } from '@internal/plugin-mca-common';

import { Knex } from 'knex';
import { DbBaseTypeRow, DbMcaRow } from './tables';
import { McaBaseTypeOrderByOptions, McaComponentOrderByOptions } from '../services/McaService/types';

export interface McaComponentsStore {

  getMcaComponent(component: string): Promise<McaComponent | undefined>;
  getMcaComponents(limit: number, offset: number, type: McaComponentType, orderBy?: McaComponentOrderByOptions, search?: string,): Promise<McaComponentListResult>;
  getMcaComponentsCount(type: McaComponentType): Promise<number>;
  getMcaVersions(): Promise<McaVersions | undefined>;
  getMcaBaseTypes(limit: number, offset: number, orderBy?: McaBaseTypeOrderByOptions, search?: string,): Promise<McaBaseTypeListResult>;
  getMcaBaseTypesCount(): Promise<number>;
  getMcaBaseType(baseTypeName: string): Promise<McaBaseType | undefined>;

  addOrUpdateMcaVersions(mcaVersions: McaVersions): Promise<void>;
  addOrUpdateMcaComponent(mcaComponent: McaComponent): Promise<void>;
  addOrUpdateBaseType(baseType: McaBaseType): Promise<void>;
}

const migrationsDir = resolvePackagePath(
  '@internal/plugin-mca-backend', // Package name
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


function mapMcaBaseTypeOrderByField(field: string): string {
  switch (field) {
    case 'baseType':
      return 'base_type';
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
    logger.info("Init Mca database");
    const client = await database.getClient();

    if (!database.migrations?.skip && !skipMigrations) {
      logger.info("Migrate mca database");
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }
    return new DatabaseMcaComponentsStore(client, logger);
  }

  async getMcaComponent(component: string): Promise<McaComponent | undefined> {
    this.logger.debug(`Fetch mca ${component}`);
    const row = await this.db<DbMcaRow>('mca_components')
      .select([
        'component',
        'prd_version',
        'p1_version',
        'p2_version',
        'p3_version',
        'p4_version',
        'application_code',
        'package_name'
      ])
      .where({ component })
      .first();

    if (!row) {
      return undefined;
    }
    return {
      component: row.component,
      prdVersion: row.prd_version,
      p1Version: row.p1_version,
      p2Version: row.p2_version,
      p3Version: row.p3_version,
      p4Version: row.p4_version,
      applicationCode: row.application_code,
      packageName: row.package_name,
    };
  }

  async getMcaComponents(offset: number, limit: number, type: McaComponentType, orderBy?: McaComponentOrderByOptions, search?: string): Promise<McaComponentListResult> {

    this.logger.debug(`Fetch mca components with offset: ${offset}, limit: ${limit}, type: ${type}, orderBy: ${orderBy}, search: ${search}`);

    // Build where conditions once
    const buildWhereConditions = (query: any) => {
      if (type === 'element') {
        query.where('type', 'e');
      } else if (type === 'operation') {
        query.where('type', 'o');
      }

      if (search) {
        const searchFields = [
          'component',
          'prd_version',
          'p1_version',
          'p2_version',
          'p3_version',
          'p4_version',
          'application_code',
          'package_name',
        ];
        const searchQuery = searchFields.map(field => `LOWER(${field}) LIKE ?`).join(' OR ');
        const searchValues = searchFields.map(() => `%${search.toLowerCase()}%`);
        query.whereRaw(`(${searchQuery})`, searchValues);
      }
    };

    const baseQuery = this.db<DbMcaRow>('mca_components')
      .select([
        'component',
        'prd_version',
        'p1_version',
        'p2_version',
        'p3_version',
        'p4_version',
        'application_code',
        'package_name'
      ])
      .offset(offset)
      .limit(limit);

    const countQuery = this.db<DbMcaRow>('mca_components')
      .count({ count: '*' });

    // Apply conditions to both queries
    buildWhereConditions(baseQuery);
    buildWhereConditions(countQuery);

    if (orderBy) {
      baseQuery.orderBy(mapMcaComponentOrderByField(orderBy.field), orderBy.direction);
    }

    this.logger.debug(`Mca components query: ${baseQuery.toQuery()}`);

    // Execute queries in parallel
    const [total, result] = await Promise.all([
      countQuery,
      baseQuery,
    ]);

    const mcaComponents: McaComponent[] = (result ?? []).map((row) => ({
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
      totalCount: Number(total[0].count),
    };
  }

  async getMcaComponentsCount(type: McaComponentType): Promise<number> {
    this.logger.debug(`Mca components count`);
    const baseQuery = this.db<DbMcaRow>('mca_components')
      .count({ count: '*' });
    if (type === 'element') {
      baseQuery.where('type', 'e');
    } else if (type === 'operation') {
      baseQuery.where('type', 'o');
    }
    const total = await baseQuery;
    this.logger.debug(`Mca components count: ${JSON.stringify(total)}`);
    return Number(total[0].count);
  }

  async getMcaVersions(): Promise<McaVersions | undefined> {
    this.logger.debug(`Fetch mca versions`);
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

  async getMcaBaseTypesCount(): Promise<number> {
    this.logger.debug(`Mca basetypes count`);
    const total = await this.db<DbBaseTypeRow>('mca_basetypes').count({ count: '*' });
    this.logger.debug(`Mca basetypes count: ${JSON.stringify(total)}`);
    return Number(total[0].count);
  }

  async getMcaBaseTypes(offset: number, limit: number, orderBy?: McaBaseTypeOrderByOptions, search?: string): Promise<McaBaseTypeListResult> {
    this.logger.debug(`Fetch mca basetypes with offset: ${offset}, limit: ${limit}, orderBy: ${orderBy}, search: ${search}`);

    const baseQuery = this.db<DbBaseTypeRow>('mca_basetypes')
      .select('*')
      .offset(offset)
      .limit(limit);
    const countQuery = this.db<DbBaseTypeRow>('mca_basetypes')
      .count({ count: '*' });

    // Search logic
    if (search) {
      const fields = ['base_type', 'package_name'];
      const searchQuery = fields.map(field => `LOWER(${field}) LIKE ?`).join(' OR ');
      const searchValues = Array(fields.length).fill(`%${search.toLowerCase()}%`);
      baseQuery.and.whereRaw(`(${searchQuery})`, searchValues);
      countQuery.and.whereRaw(`(${searchQuery})`, searchValues);
    }

    // Order by logic
    if (orderBy) {
      baseQuery.orderBy(mapMcaBaseTypeOrderByField(orderBy.field), orderBy.direction);
    }

    const [total, result] = await Promise.all([
      countQuery,
      baseQuery,
    ]);

    const mcaBaseTypes: McaBaseType[] = (result ?? []).map(row => ({
      baseType: row.base_type,
      packageName: row.package_name,
    }));
    return {
      items: mcaBaseTypes,
      offset,
      limit,
      totalCount: Number(total[0].count),
    };
  }

  async getMcaBaseType(baseTypeName: string): Promise<McaBaseType | undefined> {
    this.logger.debug(`Fetch mca ${baseTypeName}`);
    const row = await this.db<DbBaseTypeRow>('mca_basetypes')
      .select('*')
      .where({ base_type: baseTypeName })
      .first();
    if (row) {
      const baseType: McaBaseType = {
        baseType: row.base_type,
        packageName: row.package_name,
      };
      return baseType;
    }
    return undefined;
  }

  async addOrUpdateMcaVersions(mcaVersions: McaVersions): Promise<void> {
    this.logger.debug(`Update mca versions`);
    await this.db('mca_versions')
      .insert({
        version: 'current',
        p1_version: mcaVersions.p1Version,
        p2_version: mcaVersions.p2Version,
        p3_version: mcaVersions.p3Version,
        p4_version: mcaVersions.p4Version,
      })
      .onConflict('version')
      .merge();
  }

  async addOrUpdateMcaComponent(mcaComponent: McaComponent): Promise<void> {
    await this.db('mca_components')
      .insert({
        component: mcaComponent.component,
        type: mcaComponent.component.startsWith('Operation') ? 'o' : 'e',
        prd_version: mcaComponent.prdVersion,
        p1_version: mcaComponent.p1Version,
        p2_version: mcaComponent.p2Version,
        p3_version: mcaComponent.p3Version,
        p4_version: mcaComponent.p4Version,
        application_code: mcaComponent.applicationCode,
        package_name: mcaComponent.packageName,
      })
      .onConflict('component')
      .merge();
  }


  async addOrUpdateBaseType(mcaBaseType: McaBaseType): Promise<void> {
    await this.db('mca_basetypes')
      .insert({
        base_type: mcaBaseType.baseType,
        package_name: mcaBaseType.packageName,
      })
      .onConflict('base_type')
      .merge();
  }

}