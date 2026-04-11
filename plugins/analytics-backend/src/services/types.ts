import { TopFeature } from "../database";

export interface AnalyticsService {
  logAnalyticsEvent(event: any): Promise<void>;
  getTotalDailyUniqueVisitors(): Promise<number>;
  getTopFeaturesByUniqueVisitors(): Promise<TopFeature[]>;
}