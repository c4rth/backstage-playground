import {
  MAX_LIST_LIMIT,
  ServiceDefinition,
  ServiceDefinitionListResult,
} from '@internal/plugin-api-platform-common';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';

export const fetchAllServices = async (
  apiPlatformApi: ApiPlatformBackendApi,
): Promise<ServiceDefinitionListResult> => {
  const items: ServiceDefinition[] = [];
  let offset = 0;
  let totalCount = 0;
  let hasMore = true;

  while (hasMore) {
    const page = await apiPlatformApi.listServices({
      ownershipType: 'all',
      offset,
      limit: MAX_LIST_LIMIT,
    });
    if (page.hasMore && page.items.length === 0) {
      throw new Error(
        'Service listing returned an empty page with more results available',
      );
    }
    items.push(...page.items);
    offset += page.items.length;
    totalCount = page.totalCount;
    hasMore = page.hasMore;
  }

  return {
    items,
    offset: 0,
    limit: items.length,
    totalCount,
    hasMore: false,
  };
};
