import { TopFeature } from "../database";
import { DailyVisitor } from "../database/types";

export interface AnalyticsService {
  logAnalyticsEvent(event: any): Promise<void>;
  getTotalDailyUniqueVisitors(days: number): Promise<DailyVisitor[]>;
  getTopFeaturesByUniqueVisitors(count: number, days: number): Promise<TopFeature[]>;
  getPluginIds(): Promise<string[]>;
}