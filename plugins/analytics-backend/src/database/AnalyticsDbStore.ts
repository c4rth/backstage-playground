import {
  coreServices,
  createServiceFactory,
  createServiceRef,
  DatabaseService,
  LoggerService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { Knex } from 'knex';
import { AnalyticsStore } from './types';


const migrationsDir = resolvePackagePath(
  '@internal/plugin-analytics-backend', // Package name
  'migrations', // Migrations directory
);

export class AnalyticsDbStore implements AnalyticsStore {
  private constructor(
    private readonly db: Knex,
  ) { }

  static async create({
    database,
    skipMigrations,
    logger,
  }: {
    database: DatabaseService;
    skipMigrations: boolean;
    logger: LoggerService;
  }): Promise<AnalyticsStore> {
    logger.info("Init Analytics database");
    const client = await database.getClient();

    if (!database.migrations?.skip && !skipMigrations) {
      logger.info("Migrate analytics database");
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }
    return new AnalyticsDbStore(client);
  }

  async storeAnalyticsEvent(visitorId: string, event: any): Promise<void> {
    await this.db('analytics_events').insert({
      visitor_id: visitorId,
      action: event.action,
      subject: event.subject,
      value: event.value ?? null,

      // Mapping from event.context
      plugin_id: event.context.pluginId,
      route_ref: event.context.routeRef,
      extension: event.context.extension,

      attributes: JSON.stringify(event.attributes || {}),
    });
  }

  async getTotalDailyUniqueVisitors(): Promise<number> {
    const result = await this.db('analytics_events')
      .select(this.db.raw('created_at::DATE as day'))
      .countDistinct('visitor_id as unique_visitors')
      .groupBy('day')
      .orderBy('day', 'desc');

    return result?.length || 0;
  }

  async getTopPagesByUniqueVisitors(limit: number): Promise<{ pagePath: string; uniqueVisitors: number }[]> {
    const results = await this.db('analytics_events')
      .select('subject as page_path')
      .count('id as total_views')
      .countDistinct('visitor_id as unique_visitors')
      .where('action', 'view')
      .groupBy('subject')
      .orderBy('unique_visitors', 'desc')
      .limit(limit);

    return results.map((row: any) => ({
      pagePath: row.page_path,
      uniqueVisitors: row.unique_visitors,
    }));
  }

  async deleteOldAnalyticsData(thresholdInDays: number): Promise<void> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - thresholdInDays);

    await this.db('analytics_events')
      .where('created_at', '<', thresholdDate.toISOString())
      .del();
  }

}

/**
 * @public
 */
export const analyticsStoreServiceRef = createServiceRef<AnalyticsStore>({
  id: 'analytics.store',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        database: coreServices.database,
        logger: coreServices.logger,
      },
      factory: async ({ database, logger }) => {
        return AnalyticsDbStore.create({
          database,
          skipMigrations: false,
          logger,
        });
      },
    }),
});