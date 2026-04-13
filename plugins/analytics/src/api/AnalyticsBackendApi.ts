import {
    createApiRef
} from '@backstage/core-plugin-api';
import {
    DiscoveryApi,
    FetchApi,
    IdentityApi,
} from '@backstage/frontend-plugin-api';

export interface AnalyticsBackend {
    getDailyUniqueUsers(days: number): Promise<DailyVisitor[]>;
    getTopFeatures(count: number, days: number): Promise<TopFeature[]>;
}

export type TopFeature = {
    featureName: string;
    uniqueVisitors: number;
    totalHits: number;
};

export type DailyVisitor = {
    date: string;
    visitors: number;
}

export class AnalyticsBackendApi implements AnalyticsBackend {

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

    static create(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi; identityApi: IdentityApi }): AnalyticsBackendApi {
        return new AnalyticsBackendApi(options);
    }

    async getDailyUniqueUsers(days: number): Promise<DailyVisitor[]> {
        const baseUrl = await this.getAnalyticsBaseUrl();
        const url = new URL(`${baseUrl}/metrics/daily-unique-users?days=${days}`);

        try {
            const response = await this.fetchApi.fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch daily unique users: ${response.statusText}`);
            }
            const data = await response.json();
            return data.count;
        } catch (error) {
            return [];
        }
    }

    async getTopFeatures(count: number, days: number): Promise<TopFeature[]> {
        const baseUrl = await this.getAnalyticsBaseUrl();
        const url = new URL(`${baseUrl}/metrics/top-features?count=${count}&days=${days}`);

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

export const analyticsBackendApiRef = createApiRef<AnalyticsBackend>({
    id: 'custom-analytics.backend',
});