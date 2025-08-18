import { appRegistryBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export function useGetOperations(
  system?: string,
  appName?: string,
  appVersion?: string,
  environment?: string,
) {
  const api = useApi(appRegistryBackendApiRef);

  const { value, loading, error } = useAsync(() => {
    if (!system || !appName || !appVersion || !environment) return Promise.resolve(undefined);
    return api.getOperations(system, appName, appVersion, environment);
  }, [api, system, appName, appVersion, environment]);

  return {
    data: value,
    loading,
    error,
  };
}