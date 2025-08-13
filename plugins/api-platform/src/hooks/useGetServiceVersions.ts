import { apiPlatformBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';


export function useGetServiceVersions(system: string, serviceName: string) {
  const api = useApi(apiPlatformBackendApiRef);

  const { value, loading, error } = useAsync(() => api.getServiceVersions(system, serviceName), [api, system, serviceName]);

  return {
    item: value,
    loading,
    error,
  };
}