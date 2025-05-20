import { mcaComponentsBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export function useGetMcaComponentDefinition(component?: string, refP?: string) {
  const api = useApi(mcaComponentsBackendApiRef);

  const { value, loading, error } = useAsync(() => {
    if (!component || !refP) return Promise.resolve(undefined);
    return api.getMcaComponentDefinition(component, refP);
  }, [api, component, refP]);

  return {
    data: value,
    loading,
    error,
  };
}