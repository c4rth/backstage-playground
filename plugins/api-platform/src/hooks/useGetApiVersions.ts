import { apiPlatformBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export function useGetApiVersions(appCode: string, apiName: string) {
  const api = useApi(apiPlatformBackendApiRef);

  const { value, loading, error } = useAsync(() => api.getApiVersions(appCode, apiName), [api, appCode, apiName]);

  return {
    apiVersions: value,
    loading,
    error,
  };
}