import { apiPlatformBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export function useGetApiVersions(apiName: string) {
  const api = useApi(apiPlatformBackendApiRef);

  const { value, loading, error } = useAsync(() => api.getApiVersions(apiName), [api, apiName]);

  return {
    apiVersions: value,
    loading,
    error,
  };
}