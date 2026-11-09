import { McpActionMetric, TopFeature } from '../database';
import { DailyVisitor } from '../database/types';

export interface AnalyticsService {
  logAnalyticsEvent(event: any): Promise<void>;
  logMcpAction(
    toolName: string,
    outcome: 'succeeded' | 'failed',
  ): Promise<void>;
  getMcpActions(days: number): Promise<McpActionMetric[]>;
  getTotalDailyUniqueVisitors(days: number): Promise<DailyVisitor[]>;
  getTopFeaturesByUniqueVisitors(
    count: number,
    days: number,
  ): Promise<TopFeature[]>;
}
