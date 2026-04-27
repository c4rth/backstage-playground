export interface AnalyticsStore {
  storeAnalyticsEvent(visitorId: string, event: any): Promise<void>;
  getTotalDailyUniqueVisitors(days: number): Promise<DailyVisitor[]>;
  getTopFeaturesByUniqueVisitors(
    count: number,
    days: number,
  ): Promise<TopFeature[]>;

  deleteOldAnalyticsData(thresholdInDays: number): Promise<void>;
}

export type TopFeature = {
  featureName: string;
  uniqueVisitors: number;
  totalHits: number;
};

export type DailyVisitor = {
  date: string;
  visitors: number;
  guests: number;
  total: number;
};
