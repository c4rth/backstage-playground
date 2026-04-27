import {
  coreServices,
  createServiceFactory,
  createServiceRef,
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
} from '@backstage/backend-plugin-api';
import { AnalyticsService } from './types';
import { createHash } from 'node:crypto';
import { Config } from '@backstage/config';
import { AnalyticsScheduledTask } from '../task';
import {
  AnalyticsStore,
  analyticsStoreServiceRef,
  TopFeature,
} from '../database';
import { DailyVisitor } from '../database/types';

export class AnalyticsDbService implements AnalyticsService {
  private readonly logger: LoggerService;
  private readonly analyticsStore: AnalyticsStore;

  constructor(options: {
    logger: LoggerService;
    analyticsStore: AnalyticsStore;
    config: Config;
    scheduler: SchedulerService;
  }) {
    this.logger = options.logger;
    this.analyticsStore = options.analyticsStore;

    this.logger.info('Initializing AnalyticsService');

    this.createScheduledTask(
      options.config,
      options.logger,
      options.analyticsStore,
      options.scheduler,
    );
  }

  async createScheduledTask(
    config: Config,
    logger: LoggerService,
    analyticsStore: AnalyticsStore,
    scheduler: SchedulerService,
  ) {
    const scheduleOperations =
      readSchedulerServiceTaskScheduleDefinitionFromConfig(
        config.getConfig('analytics.schedule'),
      );
    await scheduler.scheduleTask({
      ...scheduleOperations,
      id: 'analytics-cleanup',
      fn: async () => {
        this.logger.info('Running scheduled task: analytics cleanup');
        AnalyticsScheduledTask.create({
          logger,
          analyticsStore,
          config,
        }).runAsync();
      },
    });
  }

  getVisitorId(req: any) {
    const event = req.body;

    if (event.user.startsWith('guest')) {
      return event.user;
    }

    // Create a salt that changes every day
    // This is the "magic" that makes it GDPR compliant
    const dailyDate = new Date().toISOString().slice(0, 10);
    const secretKey = process.env.APP_SECRET; // A static secret key

    return createHash('sha256')
      .update(`${event.user}-${dailyDate}-${secretKey}`)
      .digest('hex');
  }

  async logAnalyticsEvent(req: any): Promise<void> {
    const event = req.body;
    const visitorId = this.getVisitorId(req);
    await this.analyticsStore.storeAnalyticsEvent(visitorId, event);
  }

  async getTotalDailyUniqueVisitors(days: number): Promise<DailyVisitor[]> {
    const visitors = await this.analyticsStore.getTotalDailyUniqueVisitors(days);
    const visitorsByDate = new Map(visitors.map(v => [v.date, v]));
    const result: DailyVisitor[] = [];
    
    const date = new Date();
    date.setDate(date.getDate() - days + 1);

    for (let i = 0; i < days; i++) {
      const dateStr = date.toISOString().slice(0, 10);
      const visitorData = visitorsByDate.get(dateStr);
      if (visitorData) {
        visitorData.total = visitorData.visitors + visitorData.guests;
      }
      result.push(visitorData ?? { date: dateStr, visitors: 0, guests: 0, total: 0 });
      date.setDate(date.getDate() + 1);
    }
    return result;
  }

  async getTopFeaturesByUniqueVisitors(
    count: number,
    days: number,
  ): Promise<TopFeature[]> {
    return this.analyticsStore.getTopFeaturesByUniqueVisitors(count, days);
  }
}

export const analyticsServiceRef = createServiceRef<AnalyticsService>({
  id: 'analytics.service',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        logger: coreServices.logger,
        analyticsStore: analyticsStoreServiceRef,
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
      },
      async factory({ logger, analyticsStore, config, scheduler }) {
        const analyticsService = new AnalyticsDbService({
          logger,
          analyticsStore,
          config,
          scheduler,
        });
        return analyticsService;
      },
    }),
});
