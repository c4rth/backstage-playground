export interface AnalyticsStore {
  storeAnalyticsEvent(visitorId: string, event: any): Promise<void>;
  getTotalDailyUniqueVisitors(days: number): Promise<DailyVisitor[]>;
  getTopFeaturesByUniqueVisitors(
    count: number,
    days: number,
  ): Promise<TopFeature[]>;
  getMcpActions(days: number): Promise<McpActionMetric[]>;

  deleteOldAnalyticsData(thresholdInDays: number): Promise<void>;
}

export type McpActionMetric = {
  toolName: string;
  succeeded: number;
  failed: number;
};

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
