export interface AnalyticsService {
  logAnalyticsEvent(event: any): Promise<void>;
}