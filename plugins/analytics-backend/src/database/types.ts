
export interface AnalyticsStore {

  storeAnalyticsEvent(visitorId: string, event: any): Promise<void>;
  getTotalDailyUniqueVisitors(): Promise<number>;
  getTopPagesByUniqueVisitors(limit: number): Promise<{ pagePath: string; uniqueVisitors: number }[]>;
  deleteOldAnalyticsData(thresholdInDays: number): Promise<void>;

}