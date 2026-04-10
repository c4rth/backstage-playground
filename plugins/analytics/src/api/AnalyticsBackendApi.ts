import { AnalyticsEvent, createApiRef, DiscoveryApi, FetchApi, } from "@backstage/core-plugin-api";

export const analyticsBackendApiRef = createApiRef<AnalyticsBackendApi>({
  id: 'plugin.analytics.service',
});

export interface AnalyticsBackendApi {

  logEvent(event: AnalyticsEvent): Promise<void>;

}

export class AnalyticsBackendClient implements AnalyticsBackendApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private baseUrlCache: string | null = null;
  private baseUrlPromise: Promise<string> | null = null;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  private async getAnalyticsBaseUrl(): Promise<string> {
    if (this.baseUrlCache) {
      return this.baseUrlCache;
    }
    if (this.baseUrlPromise) {
      return this.baseUrlPromise;
    }
    this.baseUrlPromise = this.discoveryApi.getBaseUrl('analytics');
    this.baseUrlCache = await this.baseUrlPromise;
    this.baseUrlPromise = null;

    return this.baseUrlCache;
  }

  async logEvent(event: AnalyticsEvent): Promise<void> {
    const baseUrl = await this.getAnalyticsBaseUrl();
    const url = new URL(`${baseUrl}/event`);

    try {
      await this.fetchApi.fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...event, 
        }),
      });
    } catch (error) {
      // ignore errors, as analytics should not impact user experience
    }
  }

}