import { useCallback } from 'react';
import { appRegistryBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';

export function useGetOperations() {
  const api = useApi(appRegistryBackendApiRef);

  return useCallback(
    async function getOperations(
      system?: string,
      appName?: string,
      appVersion?: string,
      environment?: string,
    ) {
      if (!system || !appName || !appVersion || !environment) return undefined;
      return api.getOperations(system, appName, appVersion, environment);
    },
    [api],
  );
}
