import {
  coreServices,
  createServiceFactory,
  createServiceRef,
  DatabaseService,
  LoggerService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { Knex } from 'knex';
import { AnalyticsStore, DailyVisitor, TopFeature } from './types';

const migrationsDir = resolvePackagePath(
  '@internal/plugin-analytics-backend', // Package name
  'migrations', // Migrations directory
);

export class AnalyticsDbStore implements AnalyticsStore {
  private constructor(private readonly db: Knex) {}

  static async create({
    database,
    skipMigrations,
    logger,
  }: {
    database: DatabaseService;
    skipMigrations: boolean;
    logger: LoggerService;
  }): Promise<AnalyticsStore> {
    logger.info('Init Analytics database');
    const client = await database.getClient();

    if (!database.migrations?.skip && !skipMigrations) {
      logger.info('Migrate analytics database');
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }
    return new AnalyticsDbStore(client);
  }

  async storeAnalyticsEvent(visitorId: string, event: any): Promise<void> {
    const context = event?.context ?? {};

    await this.db('analytics_events').insert({
      visitor_id: visitorId,
      action: event?.action ?? 'unknown',
      subject: event?.subject ?? context.routeRef ?? 'unknown',
      value: event.value ?? null,

      // Mapping from event.context
      plugin_id: context.pluginId ?? null,
      route_ref: context.routeRef ?? null,
      extension: context.extension ?? null,

      attributes: JSON.stringify(event.attributes || {}),
    });
  }

  async getTotalDailyUniqueVisitors(days: number): Promise<DailyVisitor[]> {
    const query = this.db('analytics_events')
      .select(this.db.raw("to_char(created_at, 'YYYY-MM-DD') as date"))
      .select(
        this.db.raw(
          "count(DISTINCT CASE WHEN visitor_id NOT LIKE 'guest%' THEN visitor_id ELSE NULL END) as visitors",
        ),
      )
      .select(
        this.db.raw(
          "count(DISTINCT CASE WHEN visitor_id LIKE 'guest%' THEN visitor_id ELSE NULL END) as guests",
        ),
      )
      .groupBy(this.db.raw("to_char(created_at, 'YYYY-MM-DD')"))
      .orderBy('date', 'asc');

    if (days === 0) {
      query.whereRaw(
        "created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'",
      );
    } else {
      query.where(
        'created_at',
        '>=',
        this.db.raw("NOW() - (? * INTERVAL '1 day')", [days]),
      );
    }

    const result = await query;

    return result.map((row: any) => ({
      date: row.date,
      visitors: Number(row.visitors ?? 0),
      guests: Number(row.guests ?? 0),
    }));
  }

  async getTopFeaturesByUniqueVisitors(
    count: number,
    days: number,
  ): Promise<TopFeature[]> {
    const query = this.db('analytics_events')
      .select('subject as page_path')
      .count('id as total_views')
      .countDistinct('visitor_id as unique_visitors')
      .where('action', 'navigate')
      .whereNot('subject', 'unknown')
      .groupBy('subject')
      .orderBy('unique_visitors', 'desc')
      .limit(count);

    if (days === 0) {
      query.whereRaw(
        "created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'",
      );
    } else {
      query.where(
        'created_at',
        '>=',
        this.db.raw("NOW() - (? * INTERVAL '1 day')", [days]),
      );
    }

    const results = await query;

    return results.map((row: any) => ({
      featureName: row.page_path,
      uniqueVisitors: Number(row.unique_visitors ?? 0),
      totalHits: Number(row.total_views ?? 0),
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
