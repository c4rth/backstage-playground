import {
    AnalyticsApi as LegacyAnalyticsApi,
    AnalyticsEvent as LegacyAnalyticsEvent,
    createApiRef
} from '@backstage/core-plugin-api';
import {
    AnalyticsEvent,
    AnalyticsImplementation,
    DiscoveryApi,
    FetchApi,
} from '@backstage/frontend-plugin-api';

export interface CustomAnalytics extends LegacyAnalyticsApi, AnalyticsImplementation{
    
    captureEvent(event: AnalyticsEvent | LegacyAnalyticsEvent): Promise<void>;

    getDailyUniqueUsers(): Promise<number>;
    getTopFeatures(): Promise<TopFeature[]>;

}

export type TopFeature = {
    featureName: string;
    uniqueVisitors: number;
};

export class CustomAnalyticsApi implements CustomAnalytics {

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

    static create(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }): CustomAnalyticsApi {
        return new CustomAnalyticsApi(options);
    }

    async captureEvent(event: AnalyticsEvent | LegacyAnalyticsEvent) {
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

    async getDailyUniqueUsers(): Promise<number> {
        const baseUrl = await this.getAnalyticsBaseUrl();
        const url = new URL(`${baseUrl}/metrics/daily-unique-users`);

        try {
            const response = await this.fetchApi.fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch daily unique users: ${response.statusText}`);
            }
            const data = await response.json();
            return data.count;
        } catch (error) {
            // In case of error, return 0 or consider caching the last known value
            return 0;
        }
    }

    async getTopFeatures(): Promise<TopFeature[]> {
        const baseUrl = await this.getAnalyticsBaseUrl();
        const url = new URL(`${baseUrl}/metrics/top-features`);

        try {
            const response = await this.fetchApi.fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch top features: ${response.statusText}`);
            }
            const data = await response.json();
            return data.features ?? [];
        } catch (error) {
            // In case of error, return an empty array or consider caching the last known value
            return [];
        }
    }
}

export const analyticsBackendApiRef = createApiRef<CustomAnalytics>({
  id: 'plugin.analytics.custom-analytics',
});