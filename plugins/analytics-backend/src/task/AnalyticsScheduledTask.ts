import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { Duration } from 'luxon';
import { AnalyticsStore } from '../database';

export type AnalyticsScheduledTaskOptions = {
  logger: LoggerService;
  analyticsStore: AnalyticsStore;
  config: Config;
};

export class AnalyticsScheduledTask {
  private readonly logger: LoggerService;
  private readonly analyticsStore: AnalyticsStore;
  private readonly config: Config;

  constructor(options: AnalyticsScheduledTaskOptions) {
    this.logger = options.logger;
    this.analyticsStore = options.analyticsStore;
    this.config = options.config;
  }

  static create(options: AnalyticsScheduledTaskOptions) {
    return new AnalyticsScheduledTask(options);
  }

  async runAsync() {
    this.logger.info(`Scheduled task: cleanup analytics data`);
    const threshold = this.config.get('analytics.threshold') as Duration;
    const thresholdInDays = Duration.isDuration(threshold)
      ? threshold.as('days')
      : 30;
    try {
      await this.analyticsStore.deleteOldAnalyticsData(thresholdInDays);
    } catch (error: any) {
      this.logger.error(`Error cleaning up analytics data: ${error.message}`);
    }
    this.logger.info(`Scheduled task completed: cleanup analytics data`);
  }
}
