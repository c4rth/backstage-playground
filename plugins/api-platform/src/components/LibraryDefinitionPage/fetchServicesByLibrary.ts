import { ServiceDefinitionListResult } from '@internal/plugin-api-platform-common';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';

export const fetchAllServices = async (
  apiPlatformApi: ApiPlatformBackendApi,
): Promise<ServiceDefinitionListResult> => {
  const result = await apiPlatformApi.listServices({
    ownershipType: 'all',
  });
  return result ?? [];
};
