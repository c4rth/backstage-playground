import {
  AnalyticsApi as LegacyAnalyticsApi,
  AnalyticsEvent as LegacyAnalyticsEvent,
  createApiRef,
} from '@backstage/core-plugin-api';
import {
  AnalyticsEvent,
  AnalyticsImplementation,
  DiscoveryApi,
  FetchApi,
  IdentityApi,
} from '@backstage/frontend-plugin-api';

export interface CustomAnalytics
  extends LegacyAnalyticsApi, AnalyticsImplementation {
  captureEvent(event: AnalyticsEvent | LegacyAnalyticsEvent): Promise<void>;
}

export type TopFeature = {
  featureName: string;
  uniqueVisitors: number;
  totalHits: number;
};

export type DailyVisitor = {
  date: string;
  visitors: number;
};

const GUEST_ENTITY_REF = 'user:default/guest';
const ANALYTICS_KEY = 'analytics_id';

export class CustomAnalyticsApi implements CustomAnalytics {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly identityApi: IdentityApi;
  private eventUrlCache: URL | null = null;
  private eventUrlPromise: Promise<URL> | null = null;
  private userHashCache: string | null = sessionStorage.getItem(ANALYTICS_KEY);
  private userHashPromise: Promise<string> | null = null;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
    identityApi: IdentityApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.identityApi = options.identityApi;
  }

  private async getEventUrl(): Promise<URL> {
    if (this.eventUrlCache) {
      return this.eventUrlCache;
    }
    if (this.eventUrlPromise) {
      return this.eventUrlPromise;
    }

    this.eventUrlPromise = (async () => {
      const baseUrl = await this.discoveryApi.getBaseUrl('analytics');
      this.eventUrlCache = new URL(`${baseUrl}/event`);
      this.eventUrlPromise = null;
      return this.eventUrlCache;
    })();

    return this.eventUrlPromise;
  }

  static create(options: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
    identityApi: IdentityApi;
  }): CustomAnalyticsApi {
    return new CustomAnalyticsApi(options);
  }

  private static readonly TEXT_ENCODER = new TextEncoder();
  private static readonly HEX_TABLE = Array.from({ length: 256 }, (_, i) =>
    i.toString(16).padStart(2, '0'),
  );

  private async hashString(message: string): Promise<string> {
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      CustomAnalyticsApi.TEXT_ENCODER.encode(message),
    );
    const bytes = new Uint8Array(hashBuffer);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += CustomAnalyticsApi.HEX_TABLE[bytes[i]];
    }
    return hex;
  }

  private async getUserHash(): Promise<string> {
    if (this.userHashCache) {
      return this.userHashCache;
    }
    if (this.userHashPromise) {
      return this.userHashPromise;
    }

    this.userHashPromise = (async () => {
      const identity = await this.identityApi.getBackstageIdentity();
      const userEntityRef = identity.userEntityRef;

      if (userEntityRef === GUEST_ENTITY_REF) {
        this.userHashCache = `guest-${crypto.randomUUID()}`;
      } else {
        this.userHashCache = await this.hashString(userEntityRef);
      }

      sessionStorage.setItem(ANALYTICS_KEY, this.userHashCache);

      this.userHashPromise = null;
      return this.userHashCache;
    })();

    return this.userHashPromise;
  }

  async captureEvent(event: AnalyticsEvent | LegacyAnalyticsEvent) {
    if (event.action !== 'navigate') {
      return;
    }

    try {
      const url = await this.getEventUrl();
      const userHash = await this.getUserHash();
      const enrichedEvent = {
        ...event,
        user: userHash,
      };
      await this.fetchApi.fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrichedEvent),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to capture analytics event', error);
    }
  }
}

export const analyticsCustomApiRef = createApiRef<CustomAnalytics>({
  id: 'custom-analytics.api',
});
