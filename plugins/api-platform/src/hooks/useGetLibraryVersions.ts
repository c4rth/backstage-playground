import { apiPlatformBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export function useGetLibraryVersions(system: string, libraryName: string, servicesCount: boolean = true) {
  const api = useApi(apiPlatformBackendApiRef);

  const { value, loading, error } = useAsync(() => api.getLibraryVersions(system, libraryName, servicesCount), [api, system, libraryName]);

  return {
    libraryVersions: value,
    loading,
    error,
  };
}