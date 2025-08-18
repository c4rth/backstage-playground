import { apiPlatformBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export function useGetApiVersions(system: string, apiName: string) {
  const api = useApi(apiPlatformBackendApiRef);

  const { value, loading, error } = useAsync(() => api.getApiVersions(system, apiName), [api, system, apiName]);

  return {
    apiVersions: value,
    loading,
    error,
  };
}