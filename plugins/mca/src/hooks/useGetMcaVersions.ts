import { mcaComponentsBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export function useGetMcaVersions() {
  const api = useApi(mcaComponentsBackendApiRef);

  const { value, loading, error } = useAsync(() => api.getMcaVersions(), [api]);

  return {
    versions: value,
    loading,
    error,
  };
}