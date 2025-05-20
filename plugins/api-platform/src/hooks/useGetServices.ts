import { apiPlatformBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export function useGetServices() {
  const api = useApi(apiPlatformBackendApiRef);

  const { value, loading, error } = useAsync(() => api.listServices(), [api]);

  return {
    items: value?.items,
    loading,
    error,
  };
}