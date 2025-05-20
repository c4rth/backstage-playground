import { appRegistryBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export function useGetOperations(
  appCode?: string,
  appName?: string,
  appVersion?: string,
  environment?: string,
) {
  const api = useApi(appRegistryBackendApiRef);

  const { value, loading, error } = useAsync(() => {
    if (!appCode || !appName || !appVersion || !environment) return Promise.resolve(undefined);
    return api.getOperations(appCode, appName, appVersion, environment);
  }, [api, appCode, appName, appVersion, environment]);

  return {
    data: value,
    loading,
    error,
  };
}