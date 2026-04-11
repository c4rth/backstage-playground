
export interface AnalyticsStore {

  storeAnalyticsEvent(visitorId: string, event: any): Promise<void>;
  getTotalDailyUniqueVisitors(): Promise<number>;
  getTopFeaturesByUniqueVisitors(limit: number): Promise<{ featureName: string; uniqueVisitors: number }[]>;
  deleteOldAnalyticsData(thresholdInDays: number): Promise<void>;

}

export type TopFeature = {
  featureName: string;
  uniqueVisitors: number;
}